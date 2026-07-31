import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { RadioGroup } from "@headlessui/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiX, FiChevronLeft, FiChevronRight, FiShoppingBag, FiCheck } from "react-icons/fi";
import { getProductImage } from "../utils/productImages";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CommentsSection = ({ comments, onAddComment, onDeleteComment, userData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [ratingStar, setRating] = useState(0);

  const openModal = (images, imageIndex) => {
    setCurrentImages(images);
    setSelectedImage(imageIndex);
  };
  const closeModal = () => { setSelectedImage(null); setCurrentImages([]); };
  const navigateImage = (direction) => {
    const newIndex = (selectedImage + direction + currentImages.length) % currentImages.length;
    setSelectedImage(newIndex);
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages(imageUrls);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddComment(commentText, uploadedImages, ratingStar);
    setCommentText("");
    setUploadedImages([]);
    setIsAddingComment(false);
  };

  return (
    <div className="mt-12" id="reviews">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
      <div className="space-y-6">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <img className="h-10 w-10 rounded-full ring-2 ring-white" src="https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg" alt={comment.name} loading="lazy" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{comment.name}</p>
                  {comment.rating > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[0, 1, 2, 3, 4].map((star) => (
                        <StarIcon key={star} className={classNames(comment.rating > star ? "text-amber-400" : "text-gray-200", "h-4 w-4")} />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">{new Date(comment.date).toLocaleDateString()}</span>
                {userData && userData.userId === comment.userId?._id && (
                  <button onClick={() => { if (window.confirm("Are you sure you want to delete this comment?")) { if (onDeleteComment) onDeleteComment(comment._id); } }}
                    className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{comment.comment}</p>
              {comment.reviewImg && comment.reviewImg.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {comment.reviewImg.map((imgSrc, index) => (
                    <img key={index} src={imgSrc} alt={`Review ${index + 1}`}
                      className="h-16 w-16 object-cover rounded-xl border-2 border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity" loading="lazy"
                      onClick={() => openModal(comment.reviewImg.map((src) => ({ src, alt: `Review Image` })), index)} />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <p className="text-gray-400 text-lg mb-1">💬</p>
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>

      {/* Add comment */}
      <div className="mt-8">
        {!isAddingComment ? (
          <button onClick={() => setIsAddingComment(true)}
            className="btn-secondary text-sm !py-2.5">
            Write a Review
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Write Your Review</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                  <StarIcon className={classNames(ratingStar >= star ? "text-amber-400" : "text-gray-200", "h-7 w-7 hover:text-amber-300 transition-colors")} />
                </button>
              ))}
            </div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
            <textarea id="comment" rows={3} className="input-field text-sm" placeholder="Share your experience..." required value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <div className="mt-3">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">Photos (optional)</label>
              <input type="file" id="images" accept="image/*" multiple onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-colors" />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" className="btn-primary text-sm !py-2.5">Submit Review</button>
              <button type="button" onClick={() => setIsAddingComment(false)} className="btn-ghost text-sm !py-2.5">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Image modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
              <FiX className="w-7 h-7" />
            </button>
            <img src={currentImages[selectedImage].src} alt={currentImages[selectedImage].alt} className="w-full h-auto rounded-2xl" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <button onClick={() => navigateImage(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => navigateImage(1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImageGallery = ({ images, openModal }) => (
  <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-4 lg:px-8">
    <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-2xl lg:block cursor-pointer group" onClick={() => openModal(0)}>
      <img src={images[0].src} alt={images[0].alt} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" />
    </div>
    <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-4">
      <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-2xl cursor-pointer group" onClick={() => openModal(1)}>
        <img src={images[1].src} alt={images[1].alt} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-2xl cursor-pointer group" onClick={() => openModal(2)}>
        <img src={images[2].src} alt={images[2].alt} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
    </div>
    <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-2xl cursor-pointer group" onClick={() => openModal(3)}>
      <img src={images[3].src} alt={images[3].alt} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" />
    </div>
  </div>
);

const ImageModal = ({ selectedImage, closeModal, navigateImage, images }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeModal}>
    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
      <button onClick={closeModal} className="absolute right-3 top-3 z-10 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all">
        <FiX className="w-5 h-5" />
      </button>
      <div className="flex justify-between absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 z-10">
        <button onClick={(e) => { e.stopPropagation(); navigateImage(-1); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); navigateImage(1); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-white p-2 rounded-2xl shadow-2xl">
        <img src={images[selectedImage].src} alt={images[selectedImage].alt} className="max-h-[80vh] object-contain mx-auto rounded-xl" />
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-1 rounded-full">
        {selectedImage + 1} / {images.length}
      </div>
    </div>
  </div>
);

export default function ProductsDetails({ userId, userData }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddToBagPopup, setShowAddToBagPopup] = useState(false);

  const openModal = (imageIndex) => setSelectedImage(imageIndex);
  const closeModal = () => setSelectedImage(null);
  const navigateImage = (direction) => {
    if (!product || !product.images) return;
    const newIndex = (selectedImage + direction + product.images.length) % product.images.length;
    setSelectedImage(newIndex);
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      if (!response.ok) throw new Error(`Error fetching product: ${response.status}`);
      const data = await response.json();
      if (data) {
        const primaryImg = getProductImage(data);
        const mappedImages = (data.images && data.images.length > 0)
          ? data.images.map((img, idx) => ({
              ...img,
              src: (!img.src || img.src.includes("tailwindui.com")) ? primaryImg : img.src
            }))
          : [
              { src: primaryImg, alt: data.name },
              { src: primaryImg, alt: data.name },
              { src: primaryImg, alt: data.name },
              { src: primaryImg, alt: data.name }
            ];
        setProduct({ ...data, imageSrc: primaryImg, images: mappedImages });
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0].name);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0].name);
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProduct(); }, [id]);

  const handleAddToBag = async () => {
    if (!selectedColor || !selectedSize) { alert("กรุณาเลือกสีและขนาดสินค้า"); return; }
    if (!userId || !userData) { alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า"); navigate("/register"); return; }
    try {
      const response = await fetch("http://localhost:3001/save-selected-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: product._id, selectedColor, selectedSize, quantity: 1 }),
      });
      const result = await response.json();
      if (response.ok) {
        setShowAddToBagPopup(true);
        setTimeout(() => setShowAddToBagPopup(false), 2500);
      } else {
        if (result.requiresAuth) { alert(result.message); navigate("/register"); }
        else { alert(`เกิดข้อผิดพลาด: ${result.message}`); }
      }
    } catch (error) {
      console.error("Error adding product to bag:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleAddComment = async (commentText, reviewImages, ratingStar) => {
    try {
      if (!userId || !userData) { alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น"); navigate("/register"); return; }
      const response = await fetch(`http://localhost:3001/products/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: userData?.fname || "Anonymous", comment: commentText, reviewImg: reviewImages, rating: ratingStar }),
      });
      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      await fetchProduct();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(`Failed to add comment: ${error.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}/comments/${commentId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Failed to delete comment: ${response.status}`);
      fetchProduct();
    } catch (error) { console.error("Error deleting comment:", error); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen page-container">
      <div className="loader"></div>
    </div>
  );
  if (error) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-red-500 font-semibold text-lg mb-2">Error loading product</p>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/products" className="btn-primary text-sm">Back to Products</Link>
      </div>
    </div>
  );
  if (!product) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-5xl mb-4">📦</p>
        <p className="text-gray-700 font-semibold text-lg mb-4">Product not found</p>
        <Link to="/products" className="btn-primary text-sm">Back to Products</Link>
      </div>
    </div>
  );

  const hasDiscount = product.discount > 0;
  const originalPrice = product.price;
  const discountedPrice = hasDiscount ? originalPrice * (1 - product.discount / 100) : originalPrice;

  return (
    <div className="page-container pb-16">
      {/* Success toast */}
      {showAddToBagPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white pl-4 pr-6 py-3 rounded-2xl shadow-xl animate-fade-in-up">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <FiCheck className="w-5 h-5" />
          </div>
          <span className="font-medium">Added to bag successfully!</span>
        </div>
      )}

      <div className="pt-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="mx-auto flex max-w-2xl items-center gap-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8 text-sm">
            <li><Link to="/" className="text-gray-400 hover:text-brand-500 transition-colors">Home</Link></li>
            <li className="text-gray-300">/</li>
            <li><Link to="/products" className="text-gray-400 hover:text-brand-500 transition-colors">Products</Link></li>
            {product.breadcrumbs && product.breadcrumbs.split(" > ").map((breadcrumb, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-gray-300">/</span>
                <span className="text-gray-600 font-medium">{breadcrumb}</span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Image Gallery */}
        <div className="relative">
          {product.images && product.images.length > 0 && <ImageGallery images={product.images} openModal={openModal} />}
          {selectedImage !== null && <ImageModal selectedImage={selectedImage} closeModal={closeModal} navigateImage={navigateImage} images={product.images} />}
        </div>

        {/* Product Info */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-100 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
          </div>

          {/* Right column: Price + Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-brand-500">${discountedPrice.toFixed(2)}</span>
                  <span className="text-xl text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                  <span className="badge-sale text-xs">-{product.discount}%</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">${originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Reviews summary */}
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
              <div className="flex items-center">
                {(() => {
                  const ratings = (product.comments || []).map((c) => c.rating || 0).filter((r) => r > 0);
                  const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
                  return [0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon key={rating} className={classNames(avg > rating ? "text-amber-400" : "text-gray-200", "h-5 w-5")} />
                  ));
                })()}
              </div>
              <a href="#reviews" className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors">
                {product.comments?.length || 0} reviews
              </a>
            </div>

            {/* Options form */}
            <form className="mt-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
                <RadioGroup value={selectedColor} onChange={setSelectedColor}>
                  <RadioGroup.Label className="sr-only">Choose a color</RadioGroup.Label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <RadioGroup.Option key={color.name} value={color.name}
                        className={({ active, checked }) => classNames(
                          color.selectedClass,
                          active && checked ? "ring ring-offset-1" : "",
                          !active && checked ? "ring-2" : "",
                          "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none"
                        )}>
                        <RadioGroup.Label as="span" className="sr-only">{color.name}</RadioGroup.Label>
                        <span className={classNames(color.class, "h-8 w-8 rounded-full border border-black/10")} />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Sizes */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Size</h3>
                  <span className="text-sm text-brand-500 hover:text-brand-600 cursor-pointer transition-colors">Size guide</span>
                </div>
                <RadioGroup value={selectedSize} onChange={setSelectedSize}>
                  <RadioGroup.Label className="sr-only">Choose a size</RadioGroup.Label>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-4">
                    {product.sizes.map((size) => (
                      <RadioGroup.Option key={size.name} value={size.name} disabled={!size.inStock}
                        className={({ active }) => classNames(
                          size.inStock ? "cursor-pointer bg-white text-gray-900 shadow-sm hover:bg-gray-50" : "cursor-not-allowed bg-gray-50 text-gray-200",
                          active ? "ring-2 ring-brand-500" : "",
                          "group relative flex items-center justify-center rounded-xl border py-3 px-4 text-sm font-medium uppercase focus:outline-none transition-all"
                        )}>
                        {({ active, checked }) => (
                          <>
                            <RadioGroup.Label as="span">{size.name}</RadioGroup.Label>
                            {size.inStock ? (
                              <span className={classNames(active ? "border" : "border-2", checked ? "border-brand-500" : "border-transparent", "pointer-events-none absolute -inset-px rounded-xl")} />
                            ) : (
                              <span className="pointer-events-none absolute -inset-px rounded-xl border-2 border-gray-200">
                                <svg className="absolute inset-0 h-full w-full stroke-2 text-gray-200" viewBox="0 0 100 100" preserveAspectRatio="none" stroke="currentColor"><line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" /></svg>
                              </span>
                            )}
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Add to bag button */}
              <button onClick={handleAddToBag} type="button"
                className="mt-8 btn-primary w-full !py-4 text-base gap-2">
                <FiShoppingBag className="w-5 h-5" />
                Add to Bag
              </button>
            </form>
          </div>

          {/* Description & highlights */}
          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-100 lg:pb-16 lg:pr-8 lg:pt-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-base text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
              <ul className="list-none space-y-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.details}</p>
            </div>
            <CommentsSection comments={product.comments || []} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} userData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}