--
-- PostgreSQL database dump
--

\restrict x4n5w8qgtsSKFrEGr0ha96SUUg9681pP2nF06yWutfZoOAceca1d9iHqPlLo8xr

-- Dumped from database version 16.11 (b740647)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feedback (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    message text NOT NULL,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.feedback OWNER TO neondb_owner;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.journal_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    content text NOT NULL,
    mood text,
    week integer,
    day integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.journal_entries OWNER TO neondb_owner;

--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suggestions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    week integer NOT NULL,
    day integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL
);


ALTER TABLE public.suggestions OWNER TO neondb_owner;

--
-- Name: user_reflections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_reflections (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    suggestion_id character varying NOT NULL,
    reflection text NOT NULL,
    ai_response text,
    sentiment text,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_reflections OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    current_week integer DEFAULT 1 NOT NULL,
    current_suggestion integer DEFAULT 1 NOT NULL,
    completed_suggestions integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_active_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: weekly_completions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.weekly_completions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    week integer NOT NULL,
    reflection text,
    completed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.weekly_completions OWNER TO neondb_owner;

--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: user_reflections user_reflections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_reflections
    ADD CONSTRAINT user_reflections_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weekly_completions weekly_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_completions
    ADD CONSTRAINT weekly_completions_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_reflections user_reflections_suggestion_id_suggestions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_reflections
    ADD CONSTRAINT user_reflections_suggestion_id_suggestions_id_fk FOREIGN KEY (suggestion_id) REFERENCES public.suggestions(id);


--
-- Name: user_reflections user_reflections_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_reflections
    ADD CONSTRAINT user_reflections_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: weekly_completions weekly_completions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_completions
    ADD CONSTRAINT weekly_completions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict x4n5w8qgtsSKFrEGr0ha96SUUg9681pP2nF06yWutfZoOAceca1d9iHqPlLo8xr

