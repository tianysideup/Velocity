import '../styles/Rentals.css';

const Rentals = () => {
  const rentalCategories = [
    {
      title: 'Vehicles',
      description: 'Premium cars and transportation solutions for every need',
      items: ['Sedans', 'SUVs', 'Luxury Vehicles', 'Vans'],
    },
    {
      title: 'Equipment',
      description: 'Professional-grade tools and equipment for any project',
      items: ['Power Tools', 'Construction Equipment', 'Tech Gear', 'Event Supplies'],
    },
    {
      title: 'Spaces',
      description: 'Versatile venues and locations for your events',
      items: ['Meeting Rooms', 'Event Spaces', 'Storage Units', 'Studio Space'],
    },
  ];

  return (
    <section id="rentals" className="rentals">
      <div className="rentals-container">
        <h2 className="section-title">Our Rental Services</h2>
        <p className="section-subtitle">
          Explore our comprehensive range of rental options designed to meet your specific requirements
        </p>

        <div className="rentals-grid">
          {rentalCategories.map((category, index) => (
            <div key={index} className="rental-category">
              <h3>{category.title}</h3>
              <p className="category-description">{category.description}</p>
              <ul className="rental-items">
                {category.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <button className="btn-link">View Details →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rentals;
