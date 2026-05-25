import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import "./index.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function SellerHeader() {
  const navigate = useNavigate();

  const onClickLogoutSeller = () => {
    Cookies.remove("seller_access_token");
    navigate("/seller-login", { replace: true });
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} className="logo" to="/seller-dashboard">
          EcoGlow
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link
              as={Link}
              to="/seller-dashboard"
              className="fw-bold text-black"
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/seller-add-product"
              className="fw-bold text-black"
            >
              Add Products
            </Nav.Link>
          </Nav>

          {Cookies.get("seller_access_token") !== undefined && (
            <Button variant="outline-danger" onClick={onClickLogoutSeller}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SellerHeader;
