# BizFlow ERP - Technical Specifications

Dokumentasi teknis untuk pengembangan BizFlow ERP.

## Overview

| Aspek          | Detail                                                                    |
| -------------- | ------------------------------------------------------------------------- |
| **Target**     | Bisnis menengah-ke-bawah di Indonesia (retail, F&B, distributor, service) |
| **Deployment** | On-premise (Local Network, Private Cloud, Hybrid)                         |
| **Platform**   | Desktop (Windows, macOS, Linux), Web Browser, Tablet (PWA)                |
| **Language**   | Bahasa Indonesia dengan fallback English                                  |

## Documents

| Document                                                                                                                         | Description                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [01-architecture.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/01-architecture.md)                       | System architecture, monorepo structure           |
| [02-database-schema.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/02-database-schema.md)                 | Prisma schema, ERD, table definitions             |
| [03-api-specifications.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/03-api-specifications.md)           | RESTful API design, endpoints, error handling     |
| [04-frontend-specifications.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/04-frontend-specifications.md) | Page routes, state management, keyboard shortcuts |
| [05-security.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/05-security.md)                               | Authentication, authorization, license validation |
| [06-hardware-integration.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/06-hardware-integration.md)       | Thermal printer, barcode scanner                  |
| [07-deployment.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/07-deployment.md)                           | Electron, Docker, environment variables           |
| [08-testing.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/08-testing.md)                                 | Test strategy, unit tests, E2E tests              |
| [09-performance.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/09-performance.md)                         | Response time targets, capacity, monitoring       |
