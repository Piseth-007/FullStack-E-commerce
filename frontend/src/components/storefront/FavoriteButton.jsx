import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FavoritesContext } from "../../context/FavoriteContext";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";

export default function FavoriteButton({
  productId,
  size = 18,
  className = "",
}) {
  const { user } = useContext(AuthContext);
  const { isFavorited, toggleFavorite } = useContext(FavoritesContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const favorited = isFavorited(productId);

  const handleClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) {
      showToast?.("Sign in to save favorites", "info");
      navigate("/login");
      return;
    }

    const wasFavorited = favorited;
    setPending(true);
    try {
      await toggleFavorite(productId);
      showToast?.(
        wasFavorited ? "Removed from favorites" : "Added to favorites",
        "success"
      );
    } catch {
      showToast?.("Couldn't update favorites", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={favorited}
      className={`inline-flex items-center justify-center shrink-0 bg-transparent border-0 p-1.5 transition-transform duration-200 hover:scale-115 active:scale-95 disabled:opacity-60 cursor-pointer ${
        favorited ? "text-clay" : "text-stone/75 hover:text-clay"
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      >
        <path d="M12 21s-6.8-4.35-9.6-8.55C.6 9.35 1.8 5.4 5.4 4.5c2-.5 4.1.3 5.3 2.05.5.7.5.7 1 0C12.9 4.8 15 4 17 4.5c3.6.9 4.8 4.85 3 7.95C18.8 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
