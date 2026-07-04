import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagramSquare,
  FaYoutube,
  FaLinkedin,
  FaTwitterSquare,
} from "react-icons/fa";

const policies = [
  { id: "privacyPolicy", displayText: "Privacy Policy" },
  { id: "refundPolicy", displayText: "Refund Policy" },
  { id: "shippingPolicy", displayText: "Shipping Policy" },
  { id: "termsOfService", displayText: "Terms of Service" },
];

const icons = [
  { id: "1", icon: <FaFacebook />, link: "https://www.facebook.com" },
  { id: "2", icon: <FaInstagramSquare />, link: "https://www.instagram.com" },
  { id: "3", icon: <FaYoutube />, link: "https://www.youtube.com" },
  { id: "4", icon: <FaLinkedin />, link: "https://www.linkedin.com" },
  { id: "5", icon: <FaTwitterSquare />, link: "https://www.twitter.com" },
];

const Footer = () => (
  <div className="container-fluid">
    <div className="row mt-4 text-start footer text-dark">
      <div className="col-12 col-md-6 p-2">
        <div className="mt-5">
          <h4 className=" mb-3  text-success">Guidelines & Policies</h4>
          <ul className="d-flex gap-2 usefull-links-list list-unstyled">
            {policies.map((policy) => (
              <li
                key={policy.id}
                className="useful-link  border-end  border-success pe-2 fw-bold"
              >
                <Link
                  className="text-decoration-none text-dark"
                  to={`/${policy.id}`}
                >
                  {policy.displayText}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="mb-3 text-success">Contact Us</h4>

          <ul className="d-flex gap-4 usefull-links-list list-unstyled">
            {icons.map((eachIcon) => (
              <li
                key={eachIcon.id}
                className="useful-link ps-1  border-end  border-success pe-3 fw-bold"
              >
                <Link
                  className="text-decoration-none text-dark"
                  to={eachIcon.link}
                >
                  {eachIcon.icon}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <h4 className="fs-3 mt-4 text-success">Why Choose Us?</h4>
        <ul className="">
          <li className="why-choose-point">
            🌿 Eco-Friendly Products – Made with natural and sustainable
            ingredients.
          </li>
          <li className="why-choose-point">
            ♻️ Sustainable Packaging – Designed to minimize waste and
            environmental impact.
          </li>
          <li className="why-choose-point">
            🐰 Cruelty-Free – Products are not tested on animals.
          </li>
          <li className="why-choose-point">
            🌎 Environmentally Responsible – Supporting a healthier planet
            through conscious choices.
          </li>
          <li className="why-choose-point">
            ✅ Quality Assured – Carefully selected products that meet high
            standards of safety and effectiveness.
          </li>
          <li className="why-choose-point">
            🚚 Convenient Shopping – Easy online ordering with secure payments
            and reliable delivery
          </li>
        </ul>
      </div>

      <div className="col-12 col-md-6 p-3">
        <h4 className="text-start mb-3  text-success">About Us</h4>
        <p className="fs-6 text-start lh-s p-1">
          At EcoCare, we believe that personal care should be good for both
          people and the planet. Our mission is to provide high-quality,
          eco-friendly personal care products that help you maintain a healthy
          lifestyle while reducing your environmental footprint. We carefully
          select products made from natural, sustainable, and responsibly
          sourced ingredients. From skincare and haircare essentials to everyday
          personal hygiene products, every item in our collection is chosen with
          a commitment to environmental responsibility, product safety, and
          customer well-being. Our goal is to make sustainable living simple and
          accessible. By offering eco-conscious alternatives to conventional
          personal care products, we empower our customers to make choices that
          contribute to a cleaner, greener future.
        </p>

        <h4 className="text-start mb-3  text-success">Our Vision</h4>
        <p className="fs-6 text-start">
          To create a world where sustainable personal care becomes the
          standard, helping individuals care for themselves while protecting the
          environment for future generations.
        </p>

        <h4 className="text-start mb-3  text-success">Our Promise</h4>
        <p className="fs-6 text-start">
          We are committed to offering products that combine effectiveness,
          sustainability, and affordability. Every purchase you make supports a
          movement toward greener living and a more sustainable future. Choose
          eco-friendly.
          <br /> Choose conscious living. Choose EcoCare.
        </p>
      </div>
    </div>
  </div>
);

export default Footer;
