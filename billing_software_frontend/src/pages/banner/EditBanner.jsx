import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import MediaUploader from "../../components/MediaUploader";
import { SECTION_OPTIONS } from "./sections";

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (type, title, msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, show, remove };
}

function ToastPortal({ toasts, remove }) {
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none"
    }}>
      {toasts.map(t => (
        <div key={t.id} className={`sbf-toast sbf-toast-${t.type}`}>
          <div className="sbf-toast-icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "!"}
          </div>
          <div className="sbf-toast-content">
            <p className="sbf-toast-title">{t.title}</p>
            {t.msg && <p className="sbf-toast-msg">{t.msg}</p>}
          </div>
          <button className="sbf-toast-x" style={{ pointerEvents: "auto" }} onClick={() => remove(t.id)}>✕</button>
          <div className="sbf-toast-progress" />
        </div>
      ))}
    </div>
  );
}

const SECTION_OPTIONS_ALL = SECTION_OPTIONS;

export default function EditBanner() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [bannerGroup, setBannerGroup] = useState("home_top");
  const [imageUrl, setImageUrl] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [timerEndAt, setTimerEndAt] = useState("");
  const [bgColor, setBgColor] = useState("#B2EDD5");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toasts, show, remove } = useToast();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) return;

    api.get(
      `/company/get_companies_by_admin?admin_id=${user.id}`
    )
    .then(res => {

      if (res.data.status) {
        setCompanies(res.data.data);
      }

    })
    .catch(err => console.log(err));

  }, []);

  const fetchBanner = async () => {

    setFetching(true);

    try {

      const res = await api.get(
        `/banner/get_by_id?id=${id}`
      );

      if (res.data.status) {

        const b = res.data.data;

        setSelectedCompany(b.company_id ? String(b.company_id) : "");
        localStorage.setItem("selected_company_id", b.company_id || "");
        setTitle(b.title || "");
        setDescription(b.description || "");
        setLinkUrl(b.link_url || "");
        setSortOrder(b.sort_order !== null && b.sort_order !== undefined ? String(b.sort_order) : "0");
        setBannerGroup(b.banner_group || "home_top");
        setImageUrl(b.image_url || "");
        setSubtitle(b.subtitle || "");
        setBadge(b.badge || "");
        setPrice(b.price !== null && b.price !== undefined && b.price !== "" ? String(b.price) : "");
        setMrp(b.mrp !== null && b.mrp !== undefined && b.mrp !== "" ? String(b.mrp) : "");
        setTimerEndAt(b.timer_end_at || "");
        setBgColor(b.bg_color || "#B2EDD5");
        setRating(b.rating !== null && b.rating !== undefined && b.rating !== "" ? String(b.rating) : "");

      } else {

        show("error", "Not found", res.data.message || "Banner not found.");

      }

    } catch (err) {

      console.error(err);
      show("error", "Server error", "Unable to load the banner.");

    } finally {

      setFetching(false);

    }
  };

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const handleSubmit = async () => {

    const textOnlyGroups = ["testimonial", "corporate_offer"];
    if (!textOnlyGroups.includes(bannerGroup) && !imageUrl) {
      show("warn", "Missing image", "Please upload a banner image.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/banner/update", {
        id,
        title: title.trim(),
        description: description.trim(),
        link_url: linkUrl.trim(),
        sort_order: sortOrder,
        banner_group: bannerGroup,
        image_url: imageUrl,
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        price: price,
        mrp: mrp,
        bg_color: bannerGroup === "laptop_deals" ? bgColor : "",
        rating: bannerGroup === "testimonial" ? rating : "",
        timer_end_at: timerEndAt || null,
      });
      if (res.data.status) {
        show("success", "Banner updated!", "The banner has been saved.");
        setTimeout(() => navigate("/banner"), 2000);
      } else {
        show("error", "Failed", res.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      show("error", "Server error", "Unable to reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sbf-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .sbf-bg-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .sbf-bg-ring-1 {
          width: 500px; height: 500px;
          border: 60px solid rgba(37,99,235,0.07);
          top: -180px; right: -160px;
        }
        .sbf-bg-ring-2 {
          width: 320px; height: 320px;
          border: 40px solid rgba(99,102,241,0.06);
          bottom: -100px; left: -80px;
        }
        .sbf-bg-dot {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(37,99,235,0.18);
          pointer-events: none;
        }

        .sbf-card {
          position: relative;
          width: 100%;
          max-width: 560px;
          background: #ffffff;
          border-radius: 26px;
          border: 1px solid rgba(226,232,240,0.8);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.9) inset,
            0 20px 60px rgba(37,99,235,0.1),
            0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
          animation: sbfSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes sbfSlideUp {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .sbf-stripe {
          height: 5px;
          background: linear-gradient(90deg, #1d4ed8, #6366f1, #3b82f6, #1d4ed8);
          background-size: 200% 100%;
          animation: sbfStripe 3s linear infinite;
        }
        @keyframes sbfStripe {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .sbf-header {
          padding: 2rem 2rem 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .sbf-icon-box {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
        }
        .sbf-header-text h1 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
        }
        .sbf-header-text p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 400;
        }

        .sbf-hr {
          height: 1px;
          background: #f1f5f9;
          margin: 0 2rem;
        }

        .sbf-body {
          padding: 1.75rem 2rem 2rem;
        }

        .sbf-field { margin-bottom: 20px; }

        .sbf-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .sbf-label {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
        }
        .sbf-char {
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 500;
          transition: color 0.2s;
        }
        .sbf-char.active { color: #3b82f6; }

        .sbf-select, .sbf-input, .sbf-textarea {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #f8faff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          color: #1e293b;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s;
        }
        .sbf-select { cursor: pointer; }
        .sbf-select:disabled { opacity: 0.6; cursor: not-allowed; }
        .sbf-input::placeholder, .sbf-textarea::placeholder { color: #c4cdd6; font-weight: 400; }
        .sbf-select:hover, .sbf-input:hover, .sbf-textarea:hover {
          border-color: #bfdbfe;
          background: #f0f6ff;
        }
        .sbf-select:focus, .sbf-input:focus, .sbf-textarea:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .sbf-textarea { resize: vertical; min-height: 80px; }

        .sbf-row {
          display: flex;
          gap: 12px;
        }
        .sbf-row .sbf-field { flex: 1; }

        .sbf-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
          color: #fff;
          box-shadow: 0 4px 18px rgba(37,99,235,0.38), 0 1px 3px rgba(37,99,235,0.15);
          position: relative;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.25s;
        }
        .sbf-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .sbf-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.45), 0 2px 6px rgba(37,99,235,0.2);
        }
        .sbf-btn:active:not(:disabled) { transform: translateY(0); }
        .sbf-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .sbf-btn-cancel {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sbf-btn-cancel:hover { background: #f8fafc; color: #475569; border-color: #cbd5e1; }

        .sbf-spinner {
          width: 17px; height: 17px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sbf-toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 290px;
          max-width: 370px;
          padding: 13px 16px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.06);
          animation: sbfToastIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @keyframes sbfToastIn {
          from { opacity:0; transform:translateX(60px) scale(0.9); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        .sbf-toast-success { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .sbf-toast-error   { background: #fff1f2; border: 1px solid #fecdd3; }
        .sbf-toast-warn    { background: #fffbeb; border: 1px solid #fde68a; }
        .sbf-toast-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .sbf-toast-success .sbf-toast-icon { background: #dcfce7; color: #16a34a; }
        .sbf-toast-error   .sbf-toast-icon { background: #ffe4e6; color: #e11d48; }
        .sbf-toast-warn    .sbf-toast-icon { background: #fef9c3; color: #b45309; }
        .sbf-toast-content { flex: 1; }
        .sbf-toast-title { font-size: 13px; font-weight: 700; margin: 0 0 2px; }
        .sbf-toast-success .sbf-toast-title { color: #15803d; }
        .sbf-toast-error   .sbf-toast-title { color: #be123c; }
        .sbf-toast-warn    .sbf-toast-title { color: #92400e; }
        .sbf-toast-msg { font-size: 12px; margin: 0; font-weight: 400; }
        .sbf-toast-success .sbf-toast-msg { color: #16a34a; }
        .sbf-toast-error   .sbf-toast-msg { color: #e11d48; }
        .sbf-toast-warn    .sbf-toast-msg { color: #b45309; }
        .sbf-toast-x {
          background: none; border: none; cursor: pointer;
          font-size: 13px; opacity: 0.4; transition: opacity 0.2s;
          flex-shrink: 0; padding: 2px;
        }
        .sbf-toast-x:hover { opacity: 0.9; }
        .sbf-toast-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          border-radius: 0 0 16px 16px;
          animation: sbfShrink 3.8s linear forwards;
        }
        .sbf-toast-success .sbf-toast-progress { background: #4ade80; }
        .sbf-toast-error   .sbf-toast-progress { background: #fb7185; }
        .sbf-toast-warn    .sbf-toast-progress { background: #fbbf24; }
        @keyframes sbfShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <ToastPortal toasts={toasts} remove={remove} />

      <div className="sbf-page">
        <div className="sbf-bg-ring sbf-bg-ring-1" />
        <div className="sbf-bg-ring sbf-bg-ring-2" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="sbf-bg-dot" style={{
            top: `${[15,25,70,80,40,60,10,90][i]}%`,
            left: `${[10,85,5,90,50,20,70,45][i]}%`,
            opacity: 0.4 + i * 0.05
          }} />
        ))}

        <div className="sbf-card">
          <div className="sbf-stripe" />

          <div className="sbf-header">
            <div className="sbf-icon-box">🖼️</div>
            <div className="sbf-header-text">
              <h1>Edit Banner</h1>
              <p>Update storefront banner</p>
            </div>
          </div>

          <div className="sbf-hr" />

          <div className="sbf-body">

            {fetching ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
                Loading...
              </div>
            ) : (
              <>
                <div className="sbf-field">
                  <div className="sbf-label-row">
                    <span className="sbf-label">Select Company</span>
                  </div>

                  <select
                    className="sbf-select"
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value);
                      localStorage.setItem("selected_company_id", e.target.value);
                    }}
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sbf-field">
                  <div className="sbf-label-row">
                    <span className="sbf-label">Section</span>
                  </div>

                  <select
                    className="sbf-select"
                    value={bannerGroup}
                    onChange={(e) => setBannerGroup(e.target.value)}
                  >
                    {SECTION_OPTIONS_ALL.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {bannerGroup !== "testimonial" && (
                <div className="sbf-field">
                  <MediaUploader
                    type="image"
                    label={
                      bannerGroup === "brand_logo" ? "Brand Logo"
                      : bannerGroup === "client_logos" ? "Client Logo"
                      : bannerGroup === "deal_of_day" ? "Product Image"
                      : bannerGroup === "laptop_deals" ? "Offer Card Image"
                      : "Banner Image"
                    }
                    value={imageUrl ? [imageUrl] : []}
                    onChange={(urls) => setImageUrl(urls[0] || "")}
                    maxCount={1}
                  />
                </div>
                )}

                <div className="sbf-field">
                  <div className="sbf-label-row">
                    <span className="sbf-label">
                      {bannerGroup === "brand_logo" ? "Brand Name"
                      : bannerGroup === "client_logos" ? "Client Name"
                      : bannerGroup === "deal_of_day" ? "Product Title"
                      : bannerGroup === "laptop_deals" ? "Card Title"
                      : bannerGroup === "testimonial" ? "Customer Name"
                      : "Banner Title"}
                    </span>
                    <span className="sbf-char">{title.length}/255</span>
                  </div>
                  <input
                    type="text"
                    className="sbf-input"
                    placeholder={
                      bannerGroup === "brand_logo" ? "e.g. Apple"
                      : bannerGroup === "client_logos" ? "e.g. Newgen"
                      : bannerGroup === "deal_of_day" ? "e.g. Apple MacBook Pro A2485 | M1 Pro"
                      : bannerGroup === "laptop_deals" ? "e.g. Macbook With M3 Chip"
                      : bannerGroup === "testimonial" ? "e.g. Sumit Saxena"
                      : "e.g. Monsoon Mega Sale"
                    }
                    value={title}
                    maxLength={255}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {bannerGroup !== "brand_logo" && bannerGroup !== "laptop_deals" && bannerGroup !== "client_logos" && (
                <div className="sbf-field">
                  <div className="sbf-label-row">
                    <span className="sbf-label">Description</span>
                  </div>
                  <textarea
                    className="sbf-textarea"
                    placeholder={
                      bannerGroup === "deal_of_day" ? "e.g. IN STOCK — ONLY 5 LEFT"
                      : bannerGroup === "testimonial" ? "e.g. Highly recommended for people searching for quality laptops in affordable prices and with warranty"
                      : "Short description shown on the banner"
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                )}

                {bannerGroup === "testimonial" && (
                  <>
                    <div className="sbf-row">
                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">Rating (1-5)</span>
                        </div>
                        <input
                          type="number"
                          className="sbf-input"
                          placeholder="5"
                          min="1"
                          max="5"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {bannerGroup === "laptop_deals" && (
                  <>
                    <div className="sbf-row">
                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">Offer Text</span>
                        </div>
                        <input
                          type="text"
                          className="sbf-input"
                          placeholder="e.g. Up to 40% OFF"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                        />
                      </div>

                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">Card Background Color</span>
                        </div>
                        <input
                          type="color"
                          className="sbf-input"
                          style={{ height: "50px", padding: "4px", cursor: "pointer" }}
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {bannerGroup === "deal_of_day" && (
                  <>
                    <div className="sbf-row">
                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">Brand Label</span>
                        </div>
                        <input
                          type="text"
                          className="sbf-input"
                          placeholder="e.g. APPLE"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                        />
                      </div>

                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">Save Badge</span>
                        </div>
                        <input
                          type="text"
                          className="sbf-input"
                          placeholder="e.g. SAVE ₹70,001 (47% OFF)"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="sbf-row">
                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">Price (₹)</span>
                        </div>
                        <input
                          type="number"
                          className="sbf-input"
                          placeholder="79999"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>

                      <div className="sbf-field">
                        <div className="sbf-label-row">
                          <span className="sbf-label">MRP (₹)</span>
                        </div>
                        <input
                          type="number"
                          className="sbf-input"
                          placeholder="150000"
                          min="0"
                          value={mrp}
                          onChange={(e) => setMrp(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="sbf-field">
                      <div className="sbf-label-row">
                        <span className="sbf-label">Countdown Timer Ends At</span>
                      </div>
                      <input
                        type="datetime-local"
                        className="sbf-input"
                        value={timerEndAt}
                        onChange={(e) => setTimerEndAt(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="sbf-row">
                  <div className="sbf-field">
                    <div className="sbf-label-row">
                      <span className="sbf-label">
                        {bannerGroup === "laptop_deals" ? "Shop Now Link (optional)"
                        : bannerGroup === "testimonial" ? "Read More Link (optional)"
                        : "Link URL (optional)"}
                      </span>
                    </div>
                    <input
                      type="url"
                      className="sbf-input"
                      placeholder="https://…"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>

                  <div className="sbf-field">
                    <div className="sbf-label-row">
                      <span className="sbf-label">Sort Order</span>
                    </div>
                    <input
                      type="number"
                      className="sbf-input"
                      placeholder="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    />
                  </div>
                </div>

                <button className="sbf-btn" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><div className="sbf-spinner" /> Saving…</>
                    : <>💾 Update Banner</>
                  }
                </button>
                <button className="sbf-btn-cancel" onClick={() => navigate("/banner")}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
