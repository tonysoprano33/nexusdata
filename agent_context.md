# Contexto del Agente - SaaS Data Analysis

Este archivo tiene como propósito mantener un registro narrativo de las decisiones de arquitectura, el estado actual del proyecto y los próximos pasos, para facilitar la transición entre diferentes sesiones o si otro agente asume la tarea.

## Resumen del Proyecto
Estamos construyendo una Plataforma SaaS para Análisis Automatizado de Datos. El usuario (Senior Data Engineer) nos ha pedido aplicar las mejores prácticas (Ingeniería de Datos + UI Premium).
El sistema permite a un usuario subir un CSV, ser parseado, limpiado inteligentemente por **Pandas**, puntuado por un Data Quality Score, procesado con un modelo ML básico (**Scikit-Learn**), e interpretado por un LLM (Capa Cognitiva de Inteligencia Artificial como OpenAI o Gemini) para generar insights humanos explicables que impacten al negocio.

## Stack Tecnológico 🚀
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Recharts, Framer Motion. (Premium UI)
- **Backend**: FastAPI, Python, Pandas, Numpy, Scikit-learn, SQLAlchemy, Uvicorn.
- **Base de Datos / Infra**: PostgreSQL vía Docker-Compose.

## Estado Actual
- [x] Aprobación del Plan de Implementación.
- [x] Creación del archivo de `task.md`.
- [x] Creación del de `agent_context.md`.
- [x] Inicialización Backend y Frontend.
- [x] Docker Compose con PostgreSQL operativo para desarrollo local.
- [x] Endpoint de carga y consulta con persistencia en PostgreSQL.
- [x] Pipeline de datos con `data_quality_score` y detección básica de anomalías.

## Próximos Pasos Inmediatos
1. Conectar dashboard frontend para mostrar `data_quality_score` y resumen de anomalías.
2. Persistir histórico de ejecuciones y filtros por fecha/estado en API.
3. Incorporar un módulo de perfilado de columnas categóricas (cardinalidad, top valores, drift básico).
4. Añadir tests backend para `data_pipeline` y endpoints críticos.

> Mensaje para próximos agentes: "El usuario espera resultados espectaculares, dignos de un SaaS pago. No utilicemos componentes genéricos y demos un enfoque primordial a los "insights" como la joya de la corona del producto. Debemos hablarle en español."
