# Rules Document

## 1. General Principles

This document outlines the rules and constraints for the AI assistant during the development of the Smart Stadium Digital Assistant. Adherence to these rules ensures consistency, quality, and alignment with project goals.

*   **Prioritize User Experience:** All design and development decisions must ultimately serve to enhance the fan experience and operational efficiency.
*   **Security First:** Implement security best practices at every layer of the application, from data handling to API endpoints.
*   **Scalability and Performance:** Design components to be scalable and performant, anticipating high traffic during events.
*   **Maintainability:** Write clean, well-documented, and modular code to facilitate future maintenance and updates.
*   **Accessibility:** Ensure the solution is accessible to all users, adhering to relevant accessibility standards.

## 2. Technical Constraints and Guidelines

### 2.1. Libraries and Frameworks

*   **Allowed:** Python (FastAPI, TensorFlow/PyTorch), Node.js (Express.js), React Native, React, Next.js, PostgreSQL, MongoDB, Redis, Apache Kafka/RabbitMQ, Docker, Kubernetes, GitHub Actions/GitLab CI/CD, Prometheus, Grafana, Tailwind CSS.
*   **Avoid:** Legacy frameworks, unmaintained libraries, or technologies that introduce significant technical debt or security vulnerabilities without clear justification.

### 2.2. Error Handling

*   Implement robust error handling mechanisms across all services.
*   Log errors comprehensively with sufficient context for debugging.
*   Provide user-friendly error messages in frontend applications.

### 2.3. Code Standards

*   Adhere to established coding conventions for Python (e.g., PEP 8) and JavaScript/TypeScript (e.g., Airbnb style guide).
*   Conduct regular code reviews to ensure quality and consistency.
*   Write comprehensive unit, integration, and end-to-end tests for all components.

### 2.4. Data Management

*   Implement data encryption at rest and in transit.
*   Adhere to data privacy regulations (e.g., GDPR, CCPA) for all collected user data, especially biometric information.
*   Implement data retention policies and secure data disposal procedures.

## 3. AI-Specific Rules

### 3.1. Decision Making

*   The AI should make logical decisions based on the user context and available data.
*   Prioritize real-world usability and practical solutions over overly complex or theoretical approaches.

### 3.2. Context Awareness

*   Maintain context across interactions and development phases to ensure continuity and avoid redundant work.
*   Leverage `Memory.md` to store and retrieve critical project information and progress updates.

### 3.3. GitHub Repository Rules (as per challenge)

*   **Maximum 3 attempts allowed.**
*   **The repository size must be less than 10 MB.**
*   **The GitHub repository must be public.**
*   **The repository should contain only one branch.**
*   **Regularly commit and push progress.**
*   **Keep all work within a single branch.**

## 4. Environment Variables and Configuration Management

To ensure secure and flexible deployment, all sensitive information and dynamic parameters will be managed through environment variables. These variables will be loaded from a `.env` file in development and configured securely in the deployment environment (e.g., Kubernetes Secrets, Cloud Run environment variables).

### 4.1. Required Environment Variables

The following environment variables are essential for the application's operation:

| Name                       | Description                                                               | Purpose                                                              |
| :------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------- |
| `VITE_GEMINI_API_KEY`      | API Key for accessing the Gemini AI service.                              | Enables AI-powered features and interactions.                        |
| `VITE_STADIUM_OPS_API_KEY` | API Key for the Stadium Operations backend.                               | Secure communication with internal stadium systems.                  |
| `VITE_STADIUM_ID`          | Unique identifier for the stadium.                                        | Contextualizes data and operations to a specific venue.              |
| `VITE_IOT_HUB_ID`          | Identifier for the IoT Hub managing stadium sensors.                      | Connects to and manages IoT device data streams.                     |
| `VITE_POS_TERMINAL_ID`     | Identifier for the Point-of-Sale terminals.                               | Integrates with concession and merchandise systems.                  |
| `VITE_CCTV_STREAM_ID`      | Identifier for the CCTV video stream.                                     | Feeds data to computer vision systems for crowd analytics.           |
| `VITE_APP_URL`             | Base URL for the application.                                             | Configures external access and callback URLs.                        |

### 4.2. Security Best Practices for Environment Variables

*   **Never commit `.env` files to version control.** Use `.env.example` for documentation purposes, but keep actual `.env` files out of the repository.
*   **Use secure injection methods in production.** For GCP deployments, **Google Secret Manager** will be used to securely store and inject environment variables at runtime, ensuring sensitive data is never hardcoded or exposed in configuration files. For other environments, platform-specific mechanisms like Kubernetes Secrets or AWS Secrets Manager should be utilized.
*   **Rotate API keys regularly.** Google Secret Manager facilitates automated rotation of API keys, which will be implemented to minimize security risks.
*   **Least Privilege Principle.** Ensure that API keys and credentials only have the minimum necessary permissions required for their function.
