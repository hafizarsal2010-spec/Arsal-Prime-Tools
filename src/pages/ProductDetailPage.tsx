import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Review } from '../types';
import { api } from '../services/api';
import {
  Star,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Plus,
  Minus,
  Send,
  AlertCircle
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProductId,
    setActiveView,
    addToCart,
    user,
    settings,
    showToast,
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!selectedProductId) return;
      try {
        setLoading(true);
        const res = await api.getProduct(selectedProductId);
        setProduct(res.product);
        setReviews(res.reviews || []);
      } catch (err: any) {
        showToast(err.message || 'Product not found', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [selectedProductId, showToast]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400">Loading digital subscription specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <button
          onClick={() => setActiveView('catalogue')}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in with your customer account to leave a verified review.', 'info');
      setActiveView('account');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please share your experience in the review box.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      const res = await api.submitReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      showToast(res.message, 'success');
      setReviews((prev) => [res.review, ...prev]);
      setReviewComment('');
      setShowReviewForm(false);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const cleanWhatsApp = (settings?.whatsappNumber || '+923001234567').replace(/[^0-9]/g, '');
  const productWaUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Hello Arsal Prime Tools, I have a question regarding ${product.name} (Rs. ${product.price}).`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumbs & Back Button */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <button
          onClick={() => setActiveView('catalogue')}
          className="hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </button>
        <span>/</span>
        <span className="text-zinc-500">{product.category}</span>
        <span>/</span>
        <span className="text-white font-medium truncate">{product.name}</span>
      </div>

      {/* Main Contiguous Purchase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Product Visual Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[4/3] rounded-3xl bg-[#151923] border border-white/[0.08] p-8 flex items-center justify-center overflow-hidden shadow-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {product.featured && (
              <div className="absolute top-4 right-4 text-xs font-bold text-red-300 bg-red-950/90 border border-red-700/50 px-3 py-1 rounded-lg backdrop-blur-md">
                ⭐ Featured Subscription
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/90 border border-emerald-700/50 px-3 py-1 rounded-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant WhatsApp &amp; Email Delivery</span>
            </div>
          </div>

          {/* Key Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#13161f] border border-white/[0.06] space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Replacement Warranty</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {product.warranty}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#13161f] border border-white/[0.06] space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>Delivery Dispatch</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {product.deliveryMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Specification & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                <span className="text-zinc-400 font-normal">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#13161f] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400">Price in Pakistani Rupees</div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  Rs. {product.price.toLocaleString()}
                </div>
              </div>
              {product.originalPrice > product.price && (
                <div className="text-right">
                  <div className="text-xs text-zinc-500 line-through font-mono">
                    Rs. {product.originalPrice.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    Save Rs. {(product.originalPrice - product.price).toLocaleString()} (
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                  </div>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Subscription Specifications Table */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-500">Plan Duration:</span>
                <div className="font-bold text-white mt-0.5">{product.duration}</div>
              </div>
              <div>
                <span className="text-zinc-500">Access Type:</span>
                <div className="font-bold text-white mt-0.5">Private / Dedicated Profile</div>
              </div>
              <div>
                <span className="text-zinc-500">Warranty Coverage:</span>
                <div className="font-bold text-white mt-0.5">{product.warranty}</div>
              </div>
              <div>
                <span className="text-zinc-500">Stock Availability:</span>
                <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>In Stock (Instant)</span>
                </div>
              </div>
            </div>

            {/* Features Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Included Features &amp; Privileges
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Module: Quantity, Add to Cart, Buy Now, WhatsApp Question */}
          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center bg-[#13161f] rounded-xl border border-white/[0.08] p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white text-xs font-bold transition-all border border-white/[0.1] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-red-400" />
                <span>Add to Shopping Bag</span>
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Instant Buy Now</span>
              </button>
            </div>

            {/* Direct WhatsApp Pre-Purchase Inquiry */}
            <a
              href={productWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Ask a question about this tool on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Description & Usage Guide */}
      <div className="p-8 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-6">
        <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">
          Product Description &amp; Usage Instructions
        </h3>
        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {product.description}
        </div>
        {product.instructions && (
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.06] space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>How Credentials &amp; Delivery Work</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {product.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Reviews & Verified Ratings Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-xl font-bold text-white font-['Syne',sans-serif]">
              Verified Customer Reviews
            </h3>
            <p className="text-xs text-zinc-400">
              Only verified purchasers of {product.name} are permitted to post reviews.
            </p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                showToast('Please login with your customer account to leave a verified review', 'info');
                setActiveView('account');
                return;
              }
              setShowReviewForm(!showReviewForm);
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-white/[0.08] transition-colors"
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Verified Review'}
          </button>
        </div>

        {/* Write a Review Modal / Expandable Form */}
        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="p-6 rounded-2xl bg-[#181c26] border border-red-500/30 space-y-4 max-w-2xl"
          >
            <h4 className="text-sm font-bold text-white">Rate Your Experience with {product.name}</h4>

            {reviewError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Rating Stars</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="p-1 text-zinc-500 hover:text-amber-400"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2 font-mono">
                  {reviewRating} out of 5
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Your Feedback &amp; Verification Experience</label>
              <textarea
                rows={3}
                placeholder="Share details about delivery speed, tool performance, and warranty responsiveness..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-white/[0.1] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Verifying Purchase...' : 'Publish Review'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#13161f] border border-white/[0.06] text-center text-xs text-zinc-400">
            No customer reviews yet. Be the first verified buyer to share your feedback!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.06] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-current' : 'text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{rev.userName}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
