import { Router, Request, Response, NextFunction } from 'express';
import {
  db,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  User,
  Product,
  Order,
  Coupon,
  Review,
  ContactMessage,
  SiteSettings
} from './db';

export const apiRouter = Router();

// Middleware: Authenticate Token
export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
  req.user = payload;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

function sanitizeUser(user: User) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.get('users');
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: (phone || '').trim(),
      passwordHash: hash,
      salt,
      role: 'customer',
      permissions: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    db.set('users', users);

    db.logActivity({
      userId: newUser.id,
      userName: newUser.name,
      userRole: 'customer',
      action: 'Customer Registered',
      details: `New customer account created for ${newUser.email}`,
      targetType: 'auth',
      targetId: newUser.id,
    });

    db.addNotification({
      userId: newUser.id,
      title: 'Welcome to Arsal Prime Tools! 🎉',
      message: 'Explore genuine digital subscriptions with instant delivery and 24/7 support.',
      type: 'system',
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return res.status(201).json({
      user: sanitizeUser(newUser),
      token,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.get('users');
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
    }

    const isMatch = verifyPassword(password, user.passwordHash, user.salt);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    db.logActivity({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'User Logged In',
      details: `${user.role.toUpperCase()} session initiated from client`,
      targetType: 'auth',
      targetId: user.id,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      user: sanitizeUser(user),
      token,
      message: 'Login successful',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.get('users');
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const { hash, salt } = hashPassword(newPassword);
      users[userIndex].passwordHash = hash;
      users[userIndex].salt = salt;
      db.set('users', users);

      db.logActivity({
        userId: users[userIndex].id,
        userName: users[userIndex].name,
        userRole: users[userIndex].role,
        action: 'Password Reset',
        details: `Password reset successfully completed for ${users[userIndex].email}`,
        targetType: 'auth',
        targetId: users[userIndex].id,
      });

      return res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    }

    return res.json({ message: 'Verification link/code simulated. Please provide your new password to proceed.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const users = db.get('users');
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: sanitizeUser(user) });
});

apiRouter.put('/auth/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const users = db.get('users');
    const userIndex = users.findIndex((u) => u.id === req.user?.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      const { hash, salt } = hashPassword(newPassword);
      user.passwordHash = hash;
      user.salt = salt;
    }

    users[userIndex] = user;
    db.set('users', users);

    db.logActivity({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'Profile Updated',
      details: 'Customer updated contact details / credentials',
      targetType: 'user',
      targetId: user.id,
    });

    return res.json({ user: sanitizeUser(user), message: 'Profile updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// 2. PRODUCTS & CATALOGUE
// ==========================================

apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { category, search, sort, featured, includeArchived } = req.query;
    let products = [...db.get('products')];

    if (includeArchived !== 'true') {
      products = products.filter((p) => !p.isArchived);
    }

    if (category && category !== 'all') {
      products = products.filter(
        (p) => p.category.toLowerCase() === String(category).toLowerCase() || p.slug.includes(String(category).toLowerCase())
      );
    }

    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'popular') {
      products.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else {
      // Default: newest
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({ products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const products = db.get('products');
  const product = products.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const allReviews = db.get('reviews');
  const reviews = allReviews.filter((r) => r.productId === product.id && r.status === 'approved');

  return res.json({ product, reviews });
});

apiRouter.post('/products', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      category,
      price,
      originalPrice,
      duration,
      deliveryMethod,
      warranty,
      stockStatus,
      featured,
      shortDescription,
      description,
      features,
      image,
      instructions,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const products = db.get('products');
    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      slug: slug ? slug.trim() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: category || 'General Tools',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.3),
      duration: duration || '1 Month Access',
      deliveryMethod: deliveryMethod || 'Direct Email Dispatch',
      warranty: warranty || '30-Day Full Replacement Warranty',
      stockStatus: stockStatus || 'in_stock',
      featured: Boolean(featured),
      shortDescription: shortDescription || '',
      description: description || '',
      features: Array.isArray(features) ? features : (features ? String(features).split('\n').filter(Boolean) : []),
      image: image || '/assets/chatgpt_suite.svg',
      instructions: instructions || 'Credentials will be emailed and displayed in your order dashboard.',
      rating: 5.0,
      reviewsCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    db.set('products', products);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Product Created',
      details: `Created product "${newProduct.name}" (Rs. ${newProduct.price})`,
      targetType: 'product',
      targetId: newProduct.id,
    });

    return res.status(201).json({ product: newProduct, message: 'Product created successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.put('/products/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const products = db.get('products');
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = products[index];
    const updated: Product = {
      ...existing,
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : existing.originalPrice,
      features: Array.isArray(req.body.features)
        ? req.body.features
        : req.body.features
        ? String(req.body.features).split('\n').filter(Boolean)
        : existing.features,
    };

    products[index] = updated;
    db.set('products', products);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Product Updated',
      details: `Updated details for "${updated.name}"`,
      targetType: 'product',
      targetId: updated.id,
    });

    return res.json({ product: updated, message: 'Product updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.delete('/products/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const products = db.get('products');
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productName = products[index].name;
    // Archive rather than hard-delete to maintain order history integrity
    products[index].isArchived = true;
    db.set('products', products);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Product Archived',
      details: `Archived product "${productName}"`,
      targetType: 'product',
      targetId: id,
    });

    return res.json({ message: 'Product archived successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// 3. CATEGORIES
// ==========================================

apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = db.get('categories');
  return res.json({ categories });
});

apiRouter.post('/categories', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const categories = db.get('categories');
    const newCategory = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      icon: icon || 'Folder',
      description: description || '',
    };

    categories.push(newCategory);
    db.set('categories', categories);

    return res.status(201).json({ category: newCategory });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// 4. COUPONS & OFFERS
// ==========================================

apiRouter.get('/coupons/active', (_req: Request, res: Response) => {
  const now = new Date().toISOString();
  const coupons = db.get('coupons').filter((c) => {
    return c.isActive && c.validFrom <= now && c.validUntil >= now && c.usedCount < c.usageLimit;
  });
  return res.json({ coupons });
});

apiRouter.post('/coupons/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const now = new Date().toISOString();
    const coupons = db.get('coupons');
    const coupon = coupons.find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase());

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    if (coupon.validFrom > now || coupon.validUntil < now) {
      return res.status(400).json({ error: 'This coupon offer has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minOrder) {
      return res.status(400).json({
        error: `Minimum order amount of Rs. ${coupon.minOrder.toLocaleString()} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((orderSubtotal * coupon.value) / 100);
    } else {
      discount = Math.min(coupon.value, orderSubtotal);
    }

    return res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/admin/coupons', requireAdmin, (_req: AuthRequest, res: Response) => {
  const coupons = db.get('coupons');
  return res.json({ coupons });
});

apiRouter.post('/admin/coupons', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { code, type, value, minOrder, usageLimit, validFrom, validUntil, isActive, eligibleCategories } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ error: 'Code, type, and discount value are required' });
    }

    const coupons = db.get('coupons');
    const existing = coupons.find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase());
    if (existing) {
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    }

    const newCoupon: Coupon = {
      id: `coup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: String(code).trim().toUpperCase(),
      type: type === 'fixed' ? 'fixed' : 'percentage',
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      validFrom: validFrom || new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      eligibleCategories: Array.isArray(eligibleCategories) ? eligibleCategories : ['all'],
    };

    coupons.push(newCoupon);
    db.set('coupons', coupons);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Coupon Created',
      details: `Created coupon ${newCoupon.code} (${newCoupon.value}${newCoupon.type === 'percentage' ? '%' : ' PKR'} off)`,
      targetType: 'coupon',
      targetId: newCoupon.id,
    });

    return res.status(201).json({ coupon: newCoupon, message: 'Coupon created successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.put('/admin/coupons/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const coupons = db.get('coupons');
    const index = coupons.findIndex((c) => c.id === id);

    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });

    coupons[index] = {
      ...coupons[index],
      ...req.body,
      code: req.body.code ? String(req.body.code).trim().toUpperCase() : coupons[index].code,
    };

    db.set('coupons', coupons);
    return res.json({ coupon: coupons[index], message: 'Coupon updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.delete('/admin/coupons/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const coupons = db.get('coupons').filter((c) => c.id !== id);
  db.set('coupons', coupons);
  return res.json({ message: 'Coupon deleted successfully' });
});

// ==========================================
// 5. ORDERS & CHECKOUT & TRACKING
// ==========================================

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryEmail,
      whatsappNumber,
      deliveryNotes,
      items,
      couponCode,
      paymentMethod,
      paymentReference,
      paymentProofNote,
      userId,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !items || !items.length) {
      return res.status(400).json({ error: 'Customer name, email, phone, and items are required' });
    }

    const products = db.get('products');
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      const prod = products.find((p) => p.id === item.productId);
      const price = prod ? prod.price : Number(item.price);
      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += price * qty;
      return {
        productId: item.productId,
        name: prod ? prod.name : item.name,
        price,
        quantity: qty,
        duration: prod ? prod.duration : item.duration || '1 Month',
        deliveryMethod: prod ? prod.deliveryMethod : item.deliveryMethod || 'Email Dispatch',
      };
    });

    let discount = 0;
    let appliedCoupon: Coupon | null = null;
    if (couponCode) {
      const coupons = db.get('coupons');
      const found = coupons.find((c) => c.code.toUpperCase() === String(couponCode).trim().toUpperCase());
      const now = new Date().toISOString();
      if (found && found.isActive && found.validFrom <= now && found.validUntil >= now && subtotal >= found.minOrder) {
        appliedCoupon = found;
        if (found.type === 'percentage') {
          discount = Math.round((subtotal * found.value) / 100);
        } else {
          discount = Math.min(found.value, subtotal);
        }
        found.usedCount += 1;
        db.set('coupons', coupons);
      }
    }

    const total = Math.max(0, subtotal - discount);

    // Unique order ID format: APT-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `APT-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const initialStatus = paymentReference && paymentReference.trim() ? 'Payment Pending' : 'Placed';

    const timeline = [
      {
        status: 'Placed',
        timestamp: now,
        actor: customerName.trim(),
        note: `Order placed via store checkout for Rs. ${total.toLocaleString()}`,
      },
    ];

    if (paymentReference && paymentReference.trim()) {
      timeline.push({
        status: 'Payment Pending',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        actor: customerName.trim(),
        note: `Submitted payment reference: ${paymentReference.trim()}`,
      });
    }

    const newOrder: Order = {
      id: orderId,
      userId: userId || null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone.trim(),
      deliveryEmail: (deliveryEmail || customerEmail).toLowerCase().trim(),
      whatsappNumber: (whatsappNumber || customerPhone).trim(),
      deliveryNotes: deliveryNotes ? deliveryNotes.trim() : undefined,
      items: validatedItems,
      subtotal,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      total,
      currency: 'PKR',
      paymentMethod: paymentMethod || 'jazzcash',
      paymentReference: paymentReference ? paymentReference.trim() : '',
      paymentProofNote: paymentProofNote ? paymentProofNote.trim() : '',
      status: initialStatus,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      deliveryCredentials: null,
      adminNotes: null,
      timeline,
      createdAt: now,
      updatedAt: now,
    };

    const orders = db.get('orders');
    orders.unshift(newOrder);
    db.set('orders', orders);

    // Customer Notification
    if (userId) {
      db.addNotification({
        userId,
        orderId: newOrder.id,
        title: `Order #${newOrder.id} Placed! 🎉`,
        message:
          initialStatus === 'Payment Pending'
            ? 'We received your payment details. Admin is currently verifying your transaction.'
            : 'Please complete your payment via JazzCash, EasyPaisa, or Raast to start processing.',
        type: initialStatus === 'Payment Pending' ? 'payment_pending' : 'order_placed',
      });
    }

    // Activity Log
    db.logActivity({
      userId: userId || 'guest',
      userName: customerName.trim(),
      userRole: userId ? 'customer' : 'guest',
      action: 'Order Placed',
      details: `Created Order #${newOrder.id} (${validatedItems.length} items, Rs. ${total.toLocaleString()})`,
      targetType: 'order',
      targetId: newOrder.id,
    });

    return res.status(201).json({
      order: newOrder,
      message: 'Order created successfully! Save your Order ID for tracking.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/orders/my-orders', requireAuth, (req: AuthRequest, res: Response) => {
  const orders = db.get('orders');
  const userEmail = req.user!.email.toLowerCase();
  const userId = req.user!.id;

  const myOrders = orders.filter(
    (o) => o.userId === userId || o.customerEmail.toLowerCase() === userEmail
  );

  return res.json({ orders: myOrders });
});

apiRouter.get('/orders/track', (req: Request, res: Response) => {
  try {
    const { orderId, emailOrPhone } = req.query;

    if (!orderId || !emailOrPhone) {
      return res.status(400).json({ error: 'Both Order Number and Customer Email or Phone are required to track.' });
    }

    const cleanOrderId = String(orderId).trim().toUpperCase();
    const cleanVerification = String(emailOrPhone).trim().toLowerCase();

    const orders = db.get('orders');
    const order = orders.find((o) => o.id.toUpperCase() === cleanOrderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found with the provided Order ID.' });
    }

    const emailMatch = order.customerEmail.toLowerCase() === cleanVerification;
    const phoneMatch = order.customerPhone.replace(/[^0-9]/g, '').includes(cleanVerification.replace(/[^0-9]/g, ''));
    const whatsappMatch = order.whatsappNumber.replace(/[^0-9]/g, '').includes(cleanVerification.replace(/[^0-9]/g, ''));

    if (!emailMatch && !phoneMatch && !whatsappMatch) {
      return res.status(403).json({
        error: 'Verification detail does not match this order. Please enter the email or phone used at checkout.',
      });
    }

    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/orders/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const orders = db.get('orders');
  const order = orders.find((o) => o.id.toUpperCase() === id.toUpperCase());

  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Authorization check: Must be admin/staff or owner of the order
  const isAdminOrStaff = req.user!.role === 'admin' || req.user!.role === 'staff';
  const isOwner =
    order.userId === req.user!.id || order.customerEmail.toLowerCase() === req.user!.email.toLowerCase();

  if (!isAdminOrStaff && !isOwner) {
    return res.status(403).json({ error: 'Access denied to this order' });
  }

  return res.json({ order });
});

apiRouter.put('/orders/:id/payment', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentReference, paymentProofNote } = req.body;

    if (!paymentReference || !paymentReference.trim()) {
      return res.status(400).json({ error: 'Payment Transaction ID (TID) or reference is required' });
    }

    const orders = db.get('orders');
    const orderIndex = orders.findIndex((o) => o.id.toUpperCase() === id.toUpperCase());

    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    const order = orders[orderIndex];
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paymentReference = paymentReference.trim();
    if (paymentProofNote) order.paymentProofNote = paymentProofNote.trim();

    if (order.status === 'Placed') {
      order.status = 'Payment Pending';
    }

    const now = new Date().toISOString();
    order.timeline.push({
      status: 'Payment Pending',
      timestamp: now,
      actor: order.customerName,
      note: `Customer submitted payment TID: ${paymentReference.trim()}`,
    });
    order.updatedAt = now;

    orders[orderIndex] = order;
    db.set('orders', orders);

    if (order.userId) {
      db.addNotification({
        userId: order.userId,
        orderId: order.id,
        title: `Payment Submitted for #${order.id}`,
        message: `Transaction reference ${paymentReference} received. Our verification team is checking your transfer.`,
        type: 'payment_pending',
      });
    }

    db.logActivity({
      userId: order.userId || 'guest',
      userName: order.customerName,
      userRole: 'customer',
      action: 'Payment Submitted',
      details: `Submitted TID ${paymentReference} for Order #${order.id}`,
      targetType: 'order',
      targetId: order.id,
    });

    return res.json({ order, message: 'Payment reference submitted successfully!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Admin Orders Management
apiRouter.get('/admin/orders', requireAdmin, (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let orders = [...db.get('orders')];

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status.toLowerCase() === String(status).toLowerCase());
    }

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.paymentReference && o.paymentReference.toLowerCase().includes(q))
      );
    }

    return res.json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.put('/admin/orders/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, subscriptionStartDate, subscriptionEndDate, deliveryCredentials, adminNotes } = req.body;

    const validStatuses = ['Placed', 'Payment Pending', 'Payment Confirmed', 'Processing', 'Delivered', 'Cancelled', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const orders = db.get('orders');
    const index = orders.findIndex((o) => o.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return res.status(404).json({ error: 'Order not found' });

    const order = orders[index];
    const previousStatus = order.status;
    const now = new Date().toISOString();

    order.status = status;
    order.updatedAt = now;

    if (subscriptionStartDate !== undefined) order.subscriptionStartDate = subscriptionStartDate;
    if (subscriptionEndDate !== undefined) order.subscriptionEndDate = subscriptionEndDate;
    if (deliveryCredentials !== undefined) order.deliveryCredentials = deliveryCredentials;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    // If delivered and no subscription dates set, auto-calculate 30 days
    if (status === 'Delivered' && !order.subscriptionStartDate) {
      order.subscriptionStartDate = now;
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      order.subscriptionEndDate = end.toISOString();
    }

    order.timeline.push({
      status,
      timestamp: now,
      actor: `${req.user!.name} (${req.user!.role})`,
      note: note || `Status updated from ${previousStatus} to ${status}`,
    });

    orders[index] = order;
    db.set('orders', orders);

    // Notify Customer
    if (order.userId) {
      let notifTitle = `Order #${order.id} Update: ${status}`;
      let notifMessage = `Your order status has changed to ${status}.`;
      let notifType: any = 'system';

      if (status === 'Payment Confirmed') {
        notifTitle = `Payment Confirmed! 💳 (#${order.id})`;
        notifMessage = 'Your payment has been verified. Your subscription account is now in processing.';
        notifType = 'payment_confirmed';
      } else if (status === 'Processing') {
        notifTitle = `Order in Processing ⚙️ (#${order.id})`;
        notifMessage = 'Our technical team is generating your access credentials or invitation.';
        notifType = 'processing';
      } else if (status === 'Delivered') {
        notifTitle = `Order Delivered! 🚀 (#${order.id})`;
        notifMessage = 'Your digital credentials and instructions are now available in your order details!';
        notifType = 'delivered';
      } else if (status === 'Cancelled') {
        notifTitle = `Order Cancelled ❌ (#${order.id})`;
        notifMessage = note || 'Your order has been cancelled. Contact support for any clarification.';
        notifType = 'cancelled';
      } else if (status === 'Refunded') {
        notifTitle = `Order Refunded 💸 (#${order.id})`;
        notifMessage = note || 'Refund has been issued to your original payment method.';
        notifType = 'refunded';
      }

      db.addNotification({
        userId: order.userId,
        orderId: order.id,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
      });
    }

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: `Order Status: ${status}`,
      details: `Updated Order #${order.id} status from ${previousStatus} to ${status}`,
      targetType: 'order',
      targetId: order.id,
    });

    return res.json({ order, message: `Order updated to ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.put('/admin/orders/:id/details', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryCredentials, subscriptionStartDate, subscriptionEndDate, adminNotes } = req.body;

    const orders = db.get('orders');
    const index = orders.findIndex((o) => o.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return res.status(404).json({ error: 'Order not found' });

    const order = orders[index];
    if (deliveryCredentials !== undefined) order.deliveryCredentials = deliveryCredentials;
    if (subscriptionStartDate !== undefined) order.subscriptionStartDate = subscriptionStartDate;
    if (subscriptionEndDate !== undefined) order.subscriptionEndDate = subscriptionEndDate;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    order.updatedAt = new Date().toISOString();
    orders[index] = order;
    db.set('orders', orders);

    return res.json({ order, message: 'Order credentials & subscription details saved.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// 6. REVIEWS (Verified purchase only)
// ==========================================

apiRouter.get('/reviews/product/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = db.get('reviews').filter((r) => r.productId === productId && r.status === 'approved');
  return res.json({ reviews });
});

apiRouter.post('/reviews', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product, rating (1-5), and review text are required' });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating)));
    const products = db.get('products');
    const product = products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Enforce verified purchase rule:
    const orders = db.get('orders');
    const verifiedOrder = orders.find(
      (o) =>
        (o.userId === req.user!.id || o.customerEmail.toLowerCase() === req.user!.email.toLowerCase()) &&
        o.items.some((i) => i.productId === productId) &&
        (o.status === 'Delivered' || o.status === 'Payment Confirmed' || o.status === 'Processing')
    );

    if (!verifiedOrder) {
      return res.status(403).json({
        error: 'Verified purchase required. You can only review digital subscriptions you have purchased and received.',
      });
    }

    const reviews = db.get('reviews');
    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName: product.name,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: numRating,
      comment: comment.trim(),
      status: 'approved', // Instant approved for verified purchaser or set to pending if desired
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    db.set('reviews', reviews);

    // Update product rating and reviews count
    const approvedProductReviews = reviews.filter((r) => r.productId === productId && r.status === 'approved');
    const avgRating =
      approvedProductReviews.reduce((sum, r) => sum + r.rating, 0) / approvedProductReviews.length;

    product.rating = Number(avgRating.toFixed(2));
    product.reviewsCount = approvedProductReviews.length;
    db.set('products', products);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Review Submitted',
      details: `Left a ${numRating}-star verified review on ${product.name}`,
      targetType: 'review',
      targetId: newReview.id,
    });

    return res.status(201).json({ review: newReview, message: 'Thank you! Your review has been published.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/admin/reviews', requireAdmin, (_req: AuthRequest, res: Response) => {
  const reviews = db.get('reviews');
  return res.json({ reviews });
});

apiRouter.put('/admin/reviews/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }

    const reviews = db.get('reviews');
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Review not found' });

    reviews[index].status = status;
    db.set('reviews', reviews);

    return res.json({ review: reviews[index], message: `Review marked as ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.delete('/admin/reviews/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const reviews = db.get('reviews').filter((r) => r.id !== id);
  db.set('reviews', reviews);
  return res.json({ message: 'Review deleted successfully' });
});

// ==========================================
// 7. CUSTOMER NOTIFICATIONS & ACTIVITY
// ==========================================

apiRouter.get('/customer/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const notifications = db.get('notifications').filter((n) => n.userId === req.user!.id);
  return res.json({ notifications });
});

apiRouter.put('/customer/notifications/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const notifications = db.get('notifications');
  const index = notifications.findIndex((n) => n.id === id && n.userId === req.user!.id);

  if (index !== -1) {
    notifications[index].read = true;
    db.set('notifications', notifications);
  }

  return res.json({ success: true });
});

apiRouter.put('/customer/notifications/mark-all-read', requireAuth, (req: AuthRequest, res: Response) => {
  const notifications = db.get('notifications');
  notifications.forEach((n) => {
    if (n.userId === req.user!.id) {
      n.read = true;
    }
  });
  db.set('notifications', notifications);
  return res.json({ success: true });
});

apiRouter.get('/customer/activity', requireAuth, (req: AuthRequest, res: Response) => {
  const activities = db.get('activities').filter((a) => a.userId === req.user!.id);
  return res.json({ activities });
});

// ==========================================
// 8. ADMIN DASHBOARD OVERVIEW & REPORTS
// ==========================================

apiRouter.get('/admin/overview', requireAdmin, (_req: AuthRequest, res: Response) => {
  try {
    const orders = db.get('orders');
    const users = db.get('users');
    const products = db.get('products');
    const activities = db.get('activities');

    const totalSales = orders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingPaymentsCount = orders.filter((o) => o.status === 'Payment Pending').length;
    const processingOrdersCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Payment Confirmed').length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
    const customersCount = users.filter((u) => u.role === 'customer').length;

    // Popular products breakdown
    const productSalesMap: Record<string, { name: string; salesCount: number; revenue: number }> = {};
    orders.forEach((order) => {
      if (order.status !== 'Cancelled' && order.status !== 'Refunded') {
        order.items.forEach((item) => {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = { name: item.name, salesCount: 0, revenue: 0 };
          }
          productSalesMap[item.productId].salesCount += item.quantity;
          productSalesMap[item.productId].revenue += item.price * item.quantity;
        });
      }
    });

    const popularProducts = Object.entries(productSalesMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return res.json({
      stats: {
        totalSales,
        totalOrders: orders.length,
        pendingPaymentsCount,
        processingOrdersCount,
        deliveredOrdersCount,
        customersCount,
        activeProductsCount: products.filter((p) => !p.isArchived).length,
      },
      recentOrders: orders.slice(0, 8),
      recentActivities: activities.slice(0, 10),
      popularProducts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/admin/customers', requireAdmin, (_req: AuthRequest, res: Response) => {
  const users = db.get('users').filter((u) => u.role === 'customer');
  const orders = db.get('orders');

  const customerList = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase());
    const totalSpent = userOrders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      ...sanitizeUser(u),
      ordersCount: userOrders.length,
      totalSpent,
      lastOrderAt: userOrders.length ? userOrders[0].createdAt : null,
    };
  });

  return res.json({ customers: customerList });
});

apiRouter.put('/admin/customers/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid customer status' });
    }

    const users = db.get('users');
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Customer not found' });

    users[index].status = status;
    db.set('users', users);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: `Customer ${status === 'active' ? 'Activated' : 'Suspended'}`,
      details: `${users[index].name} (${users[index].email}) status changed to ${status}`,
      targetType: 'user',
      targetId: id,
    });

    return res.json({ customer: sanitizeUser(users[index]), message: `Customer is now ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Admin Staff Management
apiRouter.get('/admin/staff', requireAdmin, (_req: AuthRequest, res: Response) => {
  const staff = db.get('users').filter((u) => u.role === 'admin' || u.role === 'staff');
  return res.json({ staff: staff.map(sanitizeUser) });
});

apiRouter.post('/admin/staff', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.get('users');
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const { hash, salt } = hashPassword(password);
    const newStaff: User = {
      id: `usr_staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: (phone || '').trim(),
      passwordHash: hash,
      salt,
      role: role === 'admin' ? 'admin' : 'staff',
      permissions: Array.isArray(permissions) ? permissions : ['manage_orders', 'manage_products'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    users.push(newStaff);
    db.set('users', users);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Staff Member Added',
      details: `Added ${newStaff.name} as ${newStaff.role}`,
      targetType: 'user',
      targetId: newStaff.id,
    });

    return res.status(201).json({ staff: sanitizeUser(newStaff), message: 'Staff member added successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/admin/activities', requireAdmin, (_req: AuthRequest, res: Response) => {
  const activities = db.get('activities');
  return res.json({ activities });
});

// Broadcast Notification
apiRouter.post('/admin/notifications/broadcast', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });

    const users = db.get('users');
    const targetUsers = targetRole === 'all' ? users : users.filter((u) => u.role === (targetRole || 'customer'));

    targetUsers.forEach((u) => {
      db.addNotification({
        userId: u.id,
        title,
        message,
        type: 'system',
      });
    });

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Broadcast Dispatched',
      details: `Sent broadcast notification to ${targetUsers.length} users`,
      targetType: 'settings',
    });

    return res.json({ message: `Broadcast sent to ${targetUsers.length} users successfully.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// 9. CONTACT MESSAGES
// ==========================================

apiRouter.post('/contact', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const contactMessages = db.get('contactMessages');
    const newMsg: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    contactMessages.unshift(newMsg);
    db.set('contactMessages', contactMessages);

    db.logActivity({
      userId: 'guest',
      userName: name.trim(),
      userRole: 'customer',
      action: 'Contact Message Received',
      details: `Inquiry from ${newMsg.email}: "${newMsg.subject}"`,
      targetType: 'user',
      targetId: newMsg.id,
    });

    return res.status(201).json({ message: 'Message sent successfully! Our team will respond shortly via email or WhatsApp.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

apiRouter.get('/admin/messages', requireAdmin, (_req: AuthRequest, res: Response) => {
  const contactMessages = db.get('contactMessages');
  return res.json({ messages: contactMessages });
});

apiRouter.put('/admin/messages/:id/reply', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    const messages = db.get('contactMessages');
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Message not found' });

    messages[index].reply = reply || messages[index].reply;
    messages[index].status = status || 'replied';
    messages[index].repliedAt = new Date().toISOString();

    db.set('contactMessages', messages);
    return res.json({ message: 'Reply recorded successfully', data: messages[index] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// 10. SITE SETTINGS
// ==========================================

apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.get('settings');
  return res.json({ settings });
});

apiRouter.put('/admin/settings', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const current = db.get('settings');
    const updated: SiteSettings = {
      ...current,
      ...req.body,
      paymentInstructions: {
        ...current.paymentInstructions,
        ...(req.body.paymentInstructions || {}),
      },
    };

    db.set('settings', updated);

    db.logActivity({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'Settings Updated',
      details: 'Admin updated store details, WhatsApp number, or payment instructions',
      targetType: 'settings',
    });

    return res.json({ settings: updated, message: 'Settings saved successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
