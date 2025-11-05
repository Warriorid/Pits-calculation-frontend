import { FC } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import Header from "../../components/Header/Header";
import "./HomePage.css";

export const HomePage: FC = () => {
  return (
    <>
      <Header />
      <Container className="home-container">
        <Row>
          <Col md={6}>
            <h1 className="home-title">Калькулятор котлованов</h1>
            <p className="home-description">
              Добро пожаловать в систему расчета котлованов! Здесь вы можете 
              выбрать материалы для расчета и управлять вашими проектами.
            </p>
            <Link to="/materials">
              <Button variant="primary" className="home-button">
                Перейти к материалам
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </>
  );
};