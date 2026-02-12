import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Testimonials from '../components/Testimonials'
import Contact from '../components/Contact'
import AppDownloadNotification from '../components/AppDownloadNotification'
import '../styles/HomePage.css'
import { getTopRentedVehicles, type Vehicle } from '../services/vehicleService'
import { FaHeadset, FaBolt, FaShieldAlt, FaRegClock, FaTag, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const HomePage = () => {
  const [topVehicles, setTopVehicles] = useState<(Vehicle & { rentalCount: number; isCurrentlyRented: boolean })[]>([])
  const [topVehiclesLoading, setTopVehiclesLoading] = useState(true)

  const getTopRentedImage = (vehicle: Vehicle) => {
    const name = vehicle.name.trim().toLowerCase()
    if (name.includes('mustang')) return '/img/Ford%20Mustang.png'
    if (name.includes('land cruiser')) return '/img/Land%20Cruiser.png'
    return vehicle.image
  }

  useEffect(() => {
    let isMounted = true

    const loadTopVehicles = async () => {
      try {
        setTopVehiclesLoading(true)
        console.log('🏠 Loading top rented vehicles for HomePage...');
        const topRentedVehicles = await getTopRentedVehicles()
        console.log('🏠 Homepage top rented vehicles loaded:', topRentedVehicles.length, topRentedVehicles);

        if (!isMounted) return

        setTopVehicles(topRentedVehicles)
      } catch (error) {
        console.error('Failed to load top rented vehicles:', error)
        if (isMounted) setTopVehicles([])
      } finally {
        if (isMounted) setTopVehiclesLoading(false)
      }
    }

    loadTopVehicles()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Hero />
      <About />

      <section className="home-fluid-section">
        <div className="home-fluid-container">
          <div className="home-fluid-content">
            <h2 className="home-fluid-title">Why Velocity</h2>
            <p className="home-fluid-subtitle">
              Simple booking, transparent pricing, and reliable inventory—designed to move at your pace.
            </p>

            <div className="home-fluid-cards" aria-hidden="true">
              <div className="home-fluid-card">
                <span className="home-fluid-card-icon" aria-hidden="true">
                  <FaBolt />
                </span>
                <span className="home-fluid-card-text">
                  <span className="home-fluid-card-title">Instant booking</span>
                  <span className="home-fluid-card-subtitle">Fast confirmation</span>
                </span>
              </div>

              <div className="home-fluid-card">
                <span className="home-fluid-card-icon" aria-hidden="true">
                  <FaShieldAlt />
                </span>
                <span className="home-fluid-card-text">
                  <span className="home-fluid-card-title">Verified quality</span>
                  <span className="home-fluid-card-subtitle">Ready-to-rent inventory</span>
                </span>
              </div>

              <div className="home-fluid-card">
                <span className="home-fluid-card-icon" aria-hidden="true">
                  <FaHeadset />
                </span>
                <span className="home-fluid-card-text">
                  <span className="home-fluid-card-title">Personal support</span>
                  <span className="home-fluid-card-subtitle">Here when you need us</span>
                </span>
              </div>

              <div className="home-fluid-card">
                <span className="home-fluid-card-icon" aria-hidden="true">
                  <FaRegClock />
                </span>
                <span className="home-fluid-card-text">
                  <span className="home-fluid-card-title">Flexible schedules</span>
                  <span className="home-fluid-card-subtitle">Hourly to long-term</span>
                </span>
              </div>

              <div className="home-fluid-card">
                <span className="home-fluid-card-icon" aria-hidden="true">
                  <FaTag />
                </span>
                <span className="home-fluid-card-text">
                  <span className="home-fluid-card-title">Transparent pricing</span>
                  <span className="home-fluid-card-subtitle">No hidden fees</span>
                </span>
              </div>

              <div className="home-fluid-card">
                <span className="home-fluid-card-icon" aria-hidden="true">
                  <FaTruck />
                </span>
                <span className="home-fluid-card-text">
                  <span className="home-fluid-card-title">Easy pickup</span>
                  <span className="home-fluid-card-subtitle">Quick handoff</span>
                </span>
              </div>
            </div>
          </div>

          <div className="home-fluid-media" aria-hidden="true">
            <img
              src="/img/second-hero.png"
              alt=""
              className="home-fluid-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="top-rented-section">
        <div className="top-rented-container">
          <h2 className="top-rented-title">Top Rented Cars</h2>
          <p className="top-rented-subtitle">
            Our most popular picks right now.
          </p>

          {topVehiclesLoading ? (
            <div className="top-rented-loading">Loading...</div>
          ) : topVehicles.length === 0 ? (
            <div className="top-rented-empty">No vehicles available yet.</div>
          ) : (
            <div className="top-rented-grid">
              {topVehicles.map((vehicle) => (
                <div key={vehicle.id ?? vehicle.name} className="top-rented-card">
                  <div className="top-rented-hero">
                    <img src={getTopRentedImage(vehicle)} alt={vehicle.name} loading="lazy" />
                    <div className="top-rented-hero-overlay" aria-hidden="true" />
                    <div className="top-rented-badges" aria-hidden="true">
                      <span className="top-rented-badge">{vehicle.type.toUpperCase()}</span>
                      <span className="top-rented-badge">#{vehicle.rentalCount} RENTS</span>
                    </div>
                  </div>

                  <div className="top-rented-body">
                    <h3 className="top-rented-name">{vehicle.name}</h3>

                    <div className="top-rented-price-row">
                      <span className="top-rented-amount">₱{vehicle.price}</span>
                      <span className="top-rented-period">/day</span>
                    </div>

                    <div className="top-rented-stats">
                      <span className="top-rented-stat top-rented-stat--availability">
                        {!vehicle.isCurrentlyRented ? (
                          <>
                            <FaCheckCircle aria-hidden="true" />
                            Available Now
                          </>
                        ) : (
                          <>
                            <FaTimesCircle aria-hidden="true" />
                            Currently Rented
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Testimonials />
      <Contact />
      <AppDownloadNotification />
    </>
  );
};

export default HomePage;
