# PeopleDesk – Employee Management System (Spring Boot + Angular)

## Requirements
- JDK 17+  - Maven 3.8+  - Node.js 20 LTS (18.19+ works)  - npm

## Run
1) Backend  (terminal 1)
   cd backend
   mvn spring-boot:run          -> http://localhost:8080
2) Frontend (terminal 2)
   cd frontend
   npm install
   npm start                    -> http://localhost:4200

Open http://localhost:4200 . Register an Admin and an Employee account, then login.
Data is stored in backend/data (H2 file DB). H2 console: http://localhost:8080/h2-console
(JDBC URL: jdbc:h2:file:./data/peopledesk, user: sa, empty password)
