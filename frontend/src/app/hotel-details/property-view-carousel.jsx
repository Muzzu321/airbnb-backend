import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import React from 'react';

const PropertyViewCarousel = ({ images = [] }) => {
  if (images.length === 0) return null;
  return (
    <section>
      <Carousel
        className="overflow-hidden rounded-lg"
        opts={{
          breakpoints: {
            '(min-width: 1024px)': { slidesToScroll: 2 },
          },
        }}
      >
        <CarouselContent className="-ml-0.5">
          {images.map((image, index) => (
            <CarouselItem key={index} className="lg:basis-1/2 pl-0.5">
              <img
                className="h-96 w-full object-cover"
                src={image}
                alt={`Property photo ${index + 1}`}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 shadow-lg" />
        <CarouselNext className="right-1 shadow-lg" />
      </Carousel>
    </section>
  );
};

export default PropertyViewCarousel;
