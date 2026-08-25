import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, setRating = null, interactive = false, size = 'w-5 h-5' }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating && setRating(star)}
            className={`focus:outline-none transition ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <Star
              className={`${size} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
