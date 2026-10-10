import React from 'react';

const HotelMetaDetails = ({ hotel }) => {
  const contact = hotel.contactInfo || {};
  const address = [contact.address, hotel.city].filter(Boolean).join(', ');
  const amenities = hotel.amenities || [];

  return (
    <>
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">{hotel.name}</h1>
        <p className="text-muted-foreground">{address}</p>
      </section>
      {amenities.length > 0 && (
        <section className="space-y-4 my-8">
          <h2 className="text-xl font-bold">Amenities</h2>
          <ul className="flex flex-wrap gap-2">
            {amenities.map((item, index) => (
              <li key={index} className="flex gap-2 items-center min-w-[180px]">
                <span className="text-sm font-medium text-muted-foreground">• {item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {(contact.phoneNumber || contact.email) && (
        <section className="space-y-2 my-8">
          <h2 className="text-xl font-bold">Contact</h2>
          {contact.phoneNumber && <p className="text-sm text-muted-foreground">Phone: {contact.phoneNumber}</p>}
          {contact.email && <p className="text-sm text-muted-foreground">Email: {contact.email}</p>}
        </section>
      )}
    </>
  );
};

export default HotelMetaDetails;
