import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Dummy testimonial data
  const testimonials = [
    {
      id: 1,
      text: "Charity is the voluntary act of giving help, typically in the form of money, time, or resources, to those in need. Charitable organizations aim to solve social, environmental, and economic challenges by addressing issues like poverty.",
      name: "Michel Smith",
      company: "Cloth Store Inc.",
      rating: 5,
    },
    {
      id: 2,
      text: "Amazing experience working with this charitable organization. Their dedication to helping communities is truly inspiring and makes a real difference in people's lives.",
      name: "Ruby Klara",
      company: "Tech Solutions Ltd.",
      rating: 5,
    },
    {
      id: 3,
      text: "The impact this organization has on local communities is remarkable. Their transparent approach and genuine care for those in need sets them apart from others.",
      name: "Bishu Kiev",
      company: "Global Enterprises",
      rating: 5,
    },
    {
      id: 4,
      text: "Working with this charity has been life-changing. Their commitment to making the world a better place is evident in everything they do.",
      name: "Sarah Johnson",
      company: "Creative Studio",
      rating: 5,
    },
    {
      id: 5,
      text: "Their approach to solving complex social issues is both innovative and effective. Proud to be associated with such a meaningful cause.",
      name: "David Chen",
      company: "Marketing Pro",
      rating: 5,
    },
    {
      id: 6,
      text: "The transparency and dedication shown by this organization is unmatched. Every donation and effort truly makes a difference.",
      name: "Lisa Anderson",
      company: "Design House",
      rating: 5,
    },
  ];

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // 4 second interval
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  const goToNext = () => {
    setCurrentIndex(
      currentIndex >= testimonials.length - 1 ? 0 : currentIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex(
      currentIndex <= 0 ? testimonials.length - 1 : currentIndex - 1
    );
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className="text-yellow-500 text-lg animate-pulse"
        style={{ animationDelay: `${index * 0.2}s` }}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="relative bg-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-red-200 to-yellow-200 rounded-full opacity-30 animate-pulse"></div> */}
        <div
          className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-yellow-200 to-red-200 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-red-300 to-yellow-300 rounded-full opacity-25 animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-10 right-20 w-36 h-36 bg-gradient-to-br from-yellow-300 to-red-300 rounded-full opacity-15 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-400 rounded-full animate-float opacity-40"></div>
        <div
          className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-50"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-red-300 rounded-full animate-float opacity-30"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-float opacity-45"
          style={{ animationDelay: "2.5s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="text-red-500 mr-2 animate-pulse" size={24} />
            <span className="text-red-600 font-medium">
              Start Donating Poor People
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
            Our Valueable{" "}
            <span className="text-yellow-500 drop-shadow-lg">Customer</span>
          </h2>
          <h3 className="text-4xl lg:text-5xl font-bold text-red-700 drop-shadow-lg">
            Awesome Feedback
          </h3>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          >
            <ChevronRight size={24} />
          </button>

          {/* Testimonials */}
          <div className="overflow-hidden mx-12">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
                >
                  <div
                    className={`bg-white rounded-3xl p-8 shadow-xl h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${
                      index === currentIndex
                        ? "border-red-400 shadow-red-200"
                        : index === currentIndex + 1
                        ? "border-yellow-400 shadow-yellow-200"
                        : "border-transparent hover:border-red-200"
                    } relative overflow-hidden`}
                  >
                    {/* Card background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-100 to-red-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-red-100 to-yellow-100 rounded-full translate-y-8 -translate-x-8 opacity-40"></div>
                    {/* Rating Stars */}
                    <div className="flex mb-6 relative z-10">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-8 line-clamp-6 relative z-10">
                      "{testimonial.text}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 via-yellow-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg animate-pulse">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-red-500 to-yellow-500 w-8 shadow-lg"
                    : "bg-red-200 hover:bg-red-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Responsive adjustments for mobile */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
            }
            25% {
              transform: translateY(-10px) rotate(5deg);
            }
            50% {
              transform: translateY(-20px) rotate(0deg);
            }
            75% {
              transform: translateY(-10px) rotate(-5deg);
            }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          @media (max-width: 768px) {
            .flex-shrink-0 {
              width: 100% !important;
            }
          }
          @media (min-width: 769px) and (max-width: 1024px) {
            .flex-shrink-0 {
              width: 50% !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Reviews;
