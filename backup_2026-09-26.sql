--
-- PostgreSQL database dump
--

\restrict 7umH84VgqHfO09oAPJLge0ejg2g7ahXH4PSf8RJMawFEnVKvTrAzfM0vbaFP14e

-- Dumped from database version 18.6 (6569466)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: admin_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_messages (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    user_name text,
    message text NOT NULL,
    reply text,
    status text DEFAULT 'new'::text,
    created_at timestamp without time zone DEFAULT now(),
    replied_at timestamp without time zone
);


ALTER TABLE public.admin_messages OWNER TO neondb_owner;

--
-- Name: admin_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_messages_id_seq OWNER TO neondb_owner;

--
-- Name: admin_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_messages_id_seq OWNED BY public.admin_messages.id;


--
-- Name: ads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ads (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    subtitle text,
    phone character varying(50),
    gradient character varying(100) DEFAULT 'from-purple-600 to-indigo-700'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    image_url text,
    text_color character varying(50) DEFAULT 'white'::character varying,
    address character varying(255),
    hours character varying(100),
    cta character varying(255)
);


ALTER TABLE public.ads OWNER TO neondb_owner;

--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ads_id_seq OWNER TO neondb_owner;

--
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;


--
-- Name: app_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.app_users (
    user_id bigint NOT NULL,
    username character varying(255),
    first_name character varying(255),
    first_seen timestamp without time zone DEFAULT now(),
    last_seen timestamp without time zone DEFAULT now()
);


ALTER TABLE public.app_users OWNER TO neondb_owner;

--
-- Name: books; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.books (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(255),
    description text,
    file_url text NOT NULL,
    cover_url text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.books OWNER TO neondb_owner;

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.books_id_seq OWNER TO neondb_owner;

--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: bot_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bot_users (
    user_id bigint NOT NULL,
    username text,
    first_name text,
    last_interaction timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bot_users OWNER TO neondb_owner;

--
-- Name: city_taxi; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.city_taxi (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.city_taxi OWNER TO neondb_owner;

--
-- Name: city_taxi_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.city_taxi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.city_taxi_id_seq OWNER TO neondb_owner;

--
-- Name: city_taxi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.city_taxi_id_seq OWNED BY public.city_taxi.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    name text NOT NULL,
    specialty text NOT NULL,
    phone text,
    address text,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    type text DEFAULT 'shifokor'::text
);


ALTER TABLE public.doctors OWNER TO neondb_owner;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO neondb_owner;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id integer NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    description text,
    event_date timestamp without time zone,
    location text,
    phone text,
    image_url text,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    company_name text NOT NULL,
    "position" text NOT NULL,
    salary text,
    description text,
    phone text NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now(),
    category text DEFAULT 'boshqa'::text
);


ALTER TABLE public.jobs OWNER TO neondb_owner;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO neondb_owner;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: listings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price character varying(50),
    phone character varying(50) NOT NULL,
    image_url text,
    user_id bigint,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    image_urls text[],
    username character varying(255),
    first_name character varying(255)
);


ALTER TABLE public.listings OWNER TO neondb_owner;

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listings_id_seq OWNER TO neondb_owner;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.news (
    id integer NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    content text,
    image_url text,
    source text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.news OWNER TO neondb_owner;

--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_id_seq OWNER TO neondb_owner;

--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: restaurant_ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.restaurant_ratings (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    rating integer NOT NULL,
    user_id bigint,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.restaurant_ratings OWNER TO neondb_owner;

--
-- Name: restaurant_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.restaurant_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_ratings_id_seq OWNER TO neondb_owner;

--
-- Name: restaurant_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.restaurant_ratings_id_seq OWNED BY public.restaurant_ratings.id;


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    name text NOT NULL,
    category text,
    address text,
    phone text,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.restaurants OWNER TO neondb_owner;

--
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_id_seq OWNER TO neondb_owner;

--
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- Name: service_providers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_providers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    category text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_providers OWNER TO neondb_owner;

--
-- Name: service_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_providers_id_seq OWNER TO neondb_owner;

--
-- Name: service_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_providers_id_seq OWNED BY public.service_providers.id;


--
-- Name: service_ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_ratings (
    id integer NOT NULL,
    provider_id integer,
    rating integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT service_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.service_ratings OWNER TO neondb_owner;

--
-- Name: service_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_ratings_id_seq OWNER TO neondb_owner;

--
-- Name: service_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_ratings_id_seq OWNED BY public.service_ratings.id;


--
-- Name: taxi_bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.taxi_bookings (
    id integer NOT NULL,
    ride_id integer,
    passenger_name text,
    passenger_phone text,
    created_at timestamp without time zone DEFAULT now(),
    user_id bigint
);


ALTER TABLE public.taxi_bookings OWNER TO neondb_owner;

--
-- Name: taxi_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.taxi_bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taxi_bookings_id_seq OWNER TO neondb_owner;

--
-- Name: taxi_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.taxi_bookings_id_seq OWNED BY public.taxi_bookings.id;


--
-- Name: taxi_drivers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.taxi_drivers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    user_id bigint
);


ALTER TABLE public.taxi_drivers OWNER TO neondb_owner;

--
-- Name: taxi_drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.taxi_drivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taxi_drivers_id_seq OWNER TO neondb_owner;

--
-- Name: taxi_drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.taxi_drivers_id_seq OWNED BY public.taxi_drivers.id;


--
-- Name: taxi_ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.taxi_ratings (
    id integer NOT NULL,
    ride_id integer,
    rating integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT taxi_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.taxi_ratings OWNER TO neondb_owner;

--
-- Name: taxi_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.taxi_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taxi_ratings_id_seq OWNER TO neondb_owner;

--
-- Name: taxi_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.taxi_ratings_id_seq OWNED BY public.taxi_ratings.id;


--
-- Name: taxi_rides; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.taxi_rides (
    id integer NOT NULL,
    driver_name text NOT NULL,
    driver_phone text NOT NULL,
    direction text NOT NULL,
    total_seats integer DEFAULT 4,
    booked_seats integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now(),
    user_id bigint
);


ALTER TABLE public.taxi_rides OWNER TO neondb_owner;

--
-- Name: taxi_rides_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.taxi_rides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taxi_rides_id_seq OWNER TO neondb_owner;

--
-- Name: taxi_rides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.taxi_rides_id_seq OWNED BY public.taxi_rides.id;


--
-- Name: user_views; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_views (
    user_id bigint NOT NULL,
    section character varying(50) NOT NULL,
    last_count integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_views OWNER TO neondb_owner;

--
-- Name: user_views_sub; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_views_sub (
    user_id bigint NOT NULL,
    section character varying(50) NOT NULL,
    subcategory character varying(50) NOT NULL,
    last_count integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_views_sub OWNER TO neondb_owner;

--
-- Name: admin_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_messages ALTER COLUMN id SET DEFAULT nextval('public.admin_messages_id_seq'::regclass);


--
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: city_taxi id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.city_taxi ALTER COLUMN id SET DEFAULT nextval('public.city_taxi_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: restaurant_ratings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.restaurant_ratings ALTER COLUMN id SET DEFAULT nextval('public.restaurant_ratings_id_seq'::regclass);


--
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- Name: service_providers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_providers ALTER COLUMN id SET DEFAULT nextval('public.service_providers_id_seq'::regclass);


--
-- Name: service_ratings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_ratings ALTER COLUMN id SET DEFAULT nextval('public.service_ratings_id_seq'::regclass);


--
-- Name: taxi_bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_bookings ALTER COLUMN id SET DEFAULT nextval('public.taxi_bookings_id_seq'::regclass);


--
-- Name: taxi_drivers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_drivers ALTER COLUMN id SET DEFAULT nextval('public.taxi_drivers_id_seq'::regclass);


--
-- Name: taxi_ratings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_ratings ALTER COLUMN id SET DEFAULT nextval('public.taxi_ratings_id_seq'::regclass);


--
-- Name: taxi_rides id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_rides ALTER COLUMN id SET DEFAULT nextval('public.taxi_rides_id_seq'::regclass);


--
-- Data for Name: admin_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_messages (id, user_id, user_name, message, reply, status, created_at, replied_at) FROM stdin;
1	988368940	@Muratovich91	рлвиалоипв	\N	new	2026-09-22 13:04:43.4824	\N
2	988368940	@Muratovich91	вавапвап	\N	new	2026-09-22 13:04:52.202777	\N
3	988368940	@Muratovich91	салом	\N	new	2026-09-22 13:04:59.399539	\N
4	988368940	@Muratovich91	Салом	\N	new	2026-09-22 13:09:09.735238	\N
5	988368940	@Muratovich91	салом	\N	new	2026-09-22 13:14:08.465723	\N
7	988368940	@Muratovich91	Салом	\N	new	2026-09-23 06:59:14.145832	\N
8	988368940	@Muratovich91	салом	\N	new	2026-09-23 07:17:50.06478	\N
9	988368940	@Muratovich91	Салом	\N	new	2026-09-23 07:43:10.631134	\N
6	988368940	@Muratovich91	Test xabar	Rahmat, murojaatingiz qabul qilindi	answered	2026-09-23 06:36:17.816436	2026-09-23 07:47:56.977049
\.


--
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ads (id, title, subtitle, phone, gradient, status, created_at, image_url, text_color, address, hours, cta) FROM stdin;
\.


--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.app_users (user_id, username, first_name, first_seen, last_seen) FROM stdin;
259258146	poirier_1	SUBMISSION KING	2026-09-26 06:46:10.590544	2026-09-26 06:46:10.590544
988368940	Muratovich91	Ахрор	2026-09-26 06:42:18.657319	2026-09-26 10:40:45.436468
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.books (id, category, title, author, description, file_url, cover_url, created_at) FROM stdin;
\.


--
-- Data for Name: bot_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bot_users (user_id, username, first_name, last_interaction) FROM stdin;
7832893898	\N	Vasilya	2026-09-23 14:22:05.964503
66677730	Fozilov_math_teacher	Bunyodbek	2026-09-23 15:35:32.819668
484326741	\N		2026-09-23 16:22:30.339029
988368940	Muratovich91	Ахрор	2026-09-26 11:37:58.058
259258146	poirier_1	SUBMISSION KING	2026-09-25 11:51:05.845741
\.


--
-- Data for Name: city_taxi; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.city_taxi (id, name, phone, description, created_at) FROM stdin;
1	Mr Taxi	1061	Tezkor xizmat	2026-09-26 06:53:26.50835
2	Roxat Taxi	2233	Tezkor xizmat	2026-09-26 06:54:20.816159
3	Royal Taxi	1187	Tezkor xizmat	2026-09-26 06:54:57.512786
4	Online Taxi	1313	Tezkor xizmat	2026-09-26 06:55:26.681397
5	Online Taxi	1189	Tezkor xizmat	2026-09-26 06:55:51.25552
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contacts (id, category, name, phone, address, created_at) FROM stdin;
3	favqulodda	Yagona favqulodda xizmat	112	/add_contact favqulodda	2026-09-26 08:22:04.26535
4	favqulodda	Yong'in xavfsizligi	101	\N	2026-09-26 08:22:28.727007
5	favqulodda	Politsiya	102	\N	2026-09-26 08:22:35.4333
6	favqulodda	Tez tibbiy yordam	103	\N	2026-09-26 08:22:41.062789
7	favqulodda	Gaz avariya xizmati	104	\N	2026-09-26 08:22:47.990978
8	favqulodda	Qutqaruv xizmati	1050	\N	2026-09-26 08:22:54.66189
9	favqulodda	FVV ishonch telefoni	1101	\N	2026-09-26 08:23:00.682811
10	aloqa	Turon Telecom	1132	11-mikrotuman, 8/26	2026-09-26 08:26:27.323284
11	aloqa	Turon Telecom (qo'shimcha)	+998 71 252 74 77	\N	2026-09-26 08:26:32.523355
12	aloqa	Uztelecom (aloqa markazi)	1084	\N	2026-09-26 08:27:18.087554
13	aloqa	Uztelecom (mobil aloqa)	1099	\N	2026-09-26 08:27:29.754699
14	aloqa	Uzkomnazorat (inspeksiya)	1144	Aloqa sifati bo'yicha shikoyatlar	2026-09-26 08:30:27.732386
15	aloqa	Uzkomnazorat (ishonch telefoni)	+998 71 202 20 19	\N	2026-09-26 08:30:38.561134
16	aloqa	Perfectum	+998 98 127 00 77	\N	2026-09-26 08:31:29.939596
17	aloqa	Perfectum (qo'shimcha)	+998 98 305 11 11	\N	2026-09-26 08:31:38.785337
18	hokimiyat	Safarov Qobil (1-o'rinbosar)	+998 90 127 40 05	\N	2026-09-26 08:32:52.844389
19	hokimiyat	Rayimqulov Nu'monjon (qurilish)	+998 93 933 25 70	\N	2026-09-26 08:33:02.019543
20	hokimiyat	Turakulova Adiba (yoshlar)	+998 90 330 05 93	\N	2026-09-26 08:33:10.118902
21	hokimiyat	Babaraimova Gulmira (investitsiya)	+998 90 934 32 03	\N	2026-09-26 08:33:17.831953
22	hokimiyat	Nigmatullayeva Sevara (oila)	+998 90 973 90 73	\N	2026-09-26 08:33:25.975025
23	hokimiyat	Ishonch telefoni	+998 71 514 77 71	\N	2026-09-26 08:33:34.327292
24	hokimiyat	Tuman hokimligi	55 902 59 79	Zafar, Mustaqillik 1	2026-09-26 08:33:48.000548
25	hokimiyat	Ishonch telefoni	+998 71 514 77 71	\N	2026-09-26 08:34:07.718829
26	banklar	Ipoteka bank	+998 78 150 11 22	Salomatlik ko'chasi, 1	2026-09-26 08:34:55.045181
27	banklar	Xalq banki	+998 71 210 20 02	Buyuk Ipak Yo'li, 1-A	2026-09-26 08:35:02.708366
28	banklar	Turonbank	+998 90 326 22 20	Zafar sh., Usmon Nasyr ko'chasi, 10	2026-09-26 08:35:13.20525
29	banklar	O'zsanoatqurilishbank	\N	Abbasov ko'chasi, 264	2026-09-26 08:35:30.168145
30	banklar	Anorbank	+998 70 214 41 85	Buyuk Ipak Yo'li, 1a	2026-09-26 08:35:45.820501
31	banklar	Agrobank	\N	Zafar sh., Gagarin ko'chasi, 15	2026-09-26 08:35:56.795403
32	banklar	Davr Bank	+998 71 207 11 22	Bekobod shahri	2026-09-26 08:36:05.510236
33	banklar	Paxtabank	+998 71 915 23 08	Zafar	2026-09-26 08:36:17.158897
34	banklar	O'zbekiston Milliy banki (NBU)	+998 78 147 15 47	Peshakov ko'chasi, 22	2026-09-26 08:36:48.290254
35	soliq	Bekobod shahar adliya bo'limi	+998 70 913 30 95	80-daha, 18-uy	2026-09-26 08:38:26.772487
36	soliq	Bekobod tuman adliya bo'limi	+998 70 935 22 30	Zafar, Mustaqillik 2	2026-09-26 08:38:37.613312
37	soliq	Bekobod fuqarolik sudi	+998 370 214 66 57	Istiqlol ko'chasi, 16	2026-09-26 08:38:55.431951
38	soliq	Bekobod shahar jinoyat sudi	+998 370 214 66 38	Istiqlol ko'chasi, 15	2026-09-26 08:39:03.92614
39	soliq	FHDY (ZAGS)	+998 291 30 70 06	80-kvartal, 18-uy	2026-09-26 08:39:30.721864
40	favqulodda	Bekobod shahar gaz bo'limi (qo'shimcha)	+998 55 903 22 14	\N	2026-09-26 08:50:23.126459
41	favqulodda	Gaz avariya xizmati	+998 71 514 22 14	\N	2026-09-26 08:50:35.70862
42	favqulodda	Bekobod tuman elektr tarmoqlari	+998 55 903 13 30	\N	2026-09-26 08:50:49.346051
43	favqulodda	Elektr ta'minoti (qisqa raqam)	1154	\N	2026-09-26 08:50:59.691788
44	favqulodda	Kommunal muammolar (Call-markaz)	1055	\N	2026-09-26 08:51:17.119134
45	yarim_tayyor	AGASI FOOD	+998 90 327 77 14	Bunyodkor ko'chasi, 55	2026-09-26 10:31:43.123333
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.doctors (id, name, specialty, phone, address, description, created_at, type) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, category, title, description, event_date, location, phone, image_url, status, created_at) FROM stdin;
3	test	Test Event	\N	\N	\N	\N	\N	active	2026-09-23 12:39:17.329233
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.jobs (id, company_name, "position", salary, description, phone, status, created_at, category) FROM stdin;
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.listings (id, category, title, description, price, phone, image_url, user_id, status, created_at, image_urls, username, first_name) FROM stdin;
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.news (id, category, title, content, image_url, source, created_at) FROM stdin;
148	jahon	BMT qarshisida namoyishlar davom etmoqda Shu hafta butun dunyodan prezident va siyosatchilar BMT oliy minbarida nutq soʻzlarkan, tashkilotning Nyu Yorkdagi bosh qarorgohi oldida namoyishlar oʻtkazildi		https://cdn4.telesco.pe/file/tjLy_kWbfczRXGcsHHPqYFOvIdvF2fj9LkJIIF5V7J3BZFx9z6WktvTkwLqKIr-c3JrM9a1yY54ZyeM2iNCXP5c_UolMx_St1bkRAgeS0AcNziuwv--JaK0zu0uNB6I4OSQM-6qb5gjkMyNKiRqjqsyh6RTCo7uX4_i615hyKqULMHjfkfdGQ2-S-Y1bEXmeZLK6lfyq7QCOopxqmP3oP9IJiFRH8Y6Hn5v9241If7nQvjRGsXqdIzddcSsMCTRZlkUkKuasyBkszw47Q-tyBfUzDsaHUkEtBDLS1oxapPB6vD4ZUqLzWvI_eGHiDTaNdDARmym1EcHPCR7jEK-PaQ	https://t.me/kunuz/100195	2026-09-26 08:22:45.130517
149	jahon	BMTdagi bayonotlar va Oq uyda mehmon bo&#39;lgan Si | “Geosiyosat AQSHda BMTning 81-sessiyasi davom etmoqda: Zelenskiy tashkilot minbaridan turib Putinni to‘xtatishga chaqirdi. Grenlandiya bo‘yicha mu		https://cdn4.telesco.pe/file/QF6srG9ORMK_ZAmiPKoygWbhzr_H1nb-zZIi2zeI4NzCRK91irbK-tvYwxsRkejs_BK1Da1eHZfhpuzcBPgSh-M8mRHdv_RcvvtM0ra7-TQtlOmOpE7HzyW0irb3X5D-xkvTvIUpC3PPrIV8QYabl3n2jZXA8qhmEjfNPFy5f0euh8LnYko1PaM-0K8Djm6eXWNyJe2bYQE042J7KeWzaJsn3z4sqWXICI-0HxYOyn-ON5CeTCZfkQR1QjV-dYqTfU7rjhnPGv_G-gD4lrLL5_pbCZ09Rnwd_lZBgMcdSSPBvqR2HT2ds0EYVdoh_yiWq_8kv04wNAc1A-9oOKCnog.jpg	https://t.me/kunuz/100196	2026-09-26 09:18:40.42356
150	jahon	Pensiya yoshini oshirmaslik boʻyicha fikrlar inobatga olinadimi?&nbsp;Masʼullar izoh berishdi Pensiya tizimini takomillashtirish boʻyicha loyiha yuzasidan aholining fikrlari rasmiylar ishtirokidagi ma		https://cdn4.telesco.pe/file/tnp_cW36g13giV7mj9feq02nCnL8-JXqY8_sH2xaB8pT5d3SMwOK4oiakx0nf-hMbyUPKoGwnyk2AgX4JF4VSfnLh8rRIeEhUdEmDktB9g_ezCy7ivMh9Trh-Nb0S6GrGM8Ck63KBsgyfM-zH5HZ3WAPVN7ivEnTBPOspgAedm5pP1wgfAIz0RmPSXk6Ffh3Em4_J-Mbd0aNFgYxHJpC6T6Hf3SJ-9IFs0pUrL6Hl1NFyuPZ_w-E3qk2VWqqXSQv9g-xCDY4nS5dPC5-2D7foeplQbZPnAZgRvBv3qvMHBB5SWta5Iyvh4tVzqHohK9XcwHvzOYpXj3S7qFNfR1AGw.jpg	https://t.me/kunuz/100197	2026-09-26 10:24:44.813668
151	jahon	Pasport yoki ID-karta yoʻqolganda nima qilish kerak? Pasport yoki ID-karta yoʻqolgan taqdirda bu haqda xabar berish va yangi hujjat rasmiylashtirish kerak. Pasport yoki ID-karta yoʻqolganda qayerga mu		https://cdn4.telesco.pe/file/l5pfuXAIYHN2zB5ISFv697aRWZJ7LM7IJSf0ykCH8Zt7TNRyJlbIrP8bESyVNvIJo6hbzWhkk7YXuaLmMw4v8x1OEGIIaG38pYqtonCfo4jCpKpaivzFneu9merH5dlqxSqkxgsaAJ4iVYLSFIN8_Hjn716mp6FC5RDSJHKFj45WfuYRKjGdQkP7lxDle3jRFhhzUUGE-UAmodW3NSOcFNNhdJMGOuO0_kud4VOMjHXWI7uzFRqlTE4VLq9Ln5bkmjvVxis94vHzqgO4jueljgXJe3nzB5XvX-GBu5GXxyVHI0cIOzGZT1S385PO0sJvh5Lu-F0bHfnb8vhIyw8gkg.jpg	https://t.me/kunuz/100198	2026-09-26 11:05:29.651338
152	jahon	Kiyevga hujumlarda 59 kishi jabrlandi, yetti kishi halok bo‘ldi 25 sentyabr kuni Rossiyaning Kiyevga hujumlari oqibatida yetti kishi halok bo‘ldi, 59 kishi jabrlandi. Kunduzgi hujumda Solomenskiy tuma		https://cdn4.telesco.pe/file/TQzux9OMYdRo0tYv73DIju8QHDWLMWZPxuTd86hzVZDU4TseyyQxcGJ2Jkb-AEIje5yV6X9RuTbYrgmLYoStjQD7CUqYn7omXbTxgyAKP6Kh6KDiO6zQb5wuEr21koiYlIZ-WfXZLagoFQxGCIUVIPvpZ87UdD5LLqnpWZOwfJSOfmY7avw-klMMVN11XFwiKfyIU3VB-_YMjU6Lkl7U6SKngCnLZl7Zq4QIa6jwpkwe0Zyn157oCgtbUk7XNw7AfX1zT8y9SaxS4ic-ERpGyTHK5IAGyRVVSBDYnTSZec_rq7iYupF-tec1k_VTFHbu608kwBbMt8QJwNyyya4d3g.jpg	https://t.me/kunuz/100199	2026-09-26 12:01:28.658139
131	jahon	Saida Mirziyoyeva JST bosh direktori bilan uchrashdi Saida Mirziyoyeva Jahon savdo tashkiloti bosh direktori Ngozi Okonjo-Iveala bilan uchrashdi. Muloqot davomida Oʻzbekistonning tashkilotga aʼzo boʻl		https://cdn4.telesco.pe/file/d3HlintxGvPvaXQycVJtrThZFJPhUCprDq69LRDeumxf-vFZZVr6cuHNPdEZesC1tNiNzO44vFgX4oTLofBxcWlm1uzhegOuE7aBb1AyMq13sGtckFB-8xeHqu9gdtbX3bXzgJZSM90T531GG0Pbi1Gr_wO51Fch7WpuLxwUYz7WwbWgK6zyf8HpBGYAQfkUzziay6V1alghRjSpFpO9NpPwKZR_vQ5JgNX-2WIS-ZG4hVuyPczRJ9-BAld0NdcPBDjXkMmrOtQF-JKLUo-GzAprHLmI1tAlr9LK6wkxsQHyb8c7T3UoOdfAWHIpJ-OwHrUvNCm2WwRdUx71cvJRMw.jpg	https://t.me/kunuz/100174	2026-09-26 08:14:13.239447
132	jahon	Kaspiydagi fojia va harakatga kelayotgan «Makka kelishuvi» – kun dayjesti • Kaspiy dengiz qirg‘og‘ida to‘satdan kuchaygan shamol 17 nafar qozog‘istonlik harbiyni dengizga olib ketdi: ularning 14 nafar		https://cdn4.telesco.pe/file/gzwipZbNw5RNl5v737zF05V0nz5kceyfEDxCogE7ChmeCQjmZ22pF3rjkpNMLSZ4nLNUaJwA4Fuz9YiXHiikTtkbMF0QvbbaQOJgPFIlOCygEP0wfQoax7VG7T4IaRTzvYYfkqWZzUsWcJnQHj1xHNcSRNXKE7jqzonqn61cn13iKL7MBCt_LKb5PIpEOcg0HqXEtCBsgIFKIQU526ulgHJNhD0gi6TaFb_KCsA4xldNRthOGYtkUob0tiar7mJ3zsjwp1lVKs62BifoKUJVG97WKRfco_hOeCLYNHonG6QAIX4yLEWAKeSLZpUJmYTHIo1Ciwt_oceXiex3nnetmA	https://t.me/kunuz/100178	2026-09-26 08:14:13.244583
133	jahon	&quot;Muayyan shart qo‘yiladigan pul&quot;. Markaziy bank raqamli so‘m ustida ishlay boshladi&nbsp; Markaziy bank raqamli so‘mni joriy etish imkoniyatlarini o‘rganmoqda. Dastlabki pilot loyihalar 2027		https://cdn4.telesco.pe/file/ZEmwc50j2BrCS5s1TvIAwFHwz2nL3pr2xmKlfjI8ikd4B-RF7OrX-_W0Z4rBLUuQJ2ov41ne3mlZmMS0rExgCGPSprf4dyE8PGnDU8JBii9a_oAVj9qDRArfoV5MK50RyhSQLPINMhbWOfWcornCFDlZgZA8FqLs0_5ECgGzofsjmR_4Hzb1D9U2pmzWa4sMxQpuacmTIVu2y5mL61vhdrS6p3glb9QK7zsu7PWYIHrZSBGwVQAlQgjRRwLInWet1QpbDzwdlrLv6qevSYbSLpV_Dlhhc9c6C6mpQNgxttlkpruAzjCIRDImG30MpKWSC8H4zrvw7PemckqrgsH3iA	https://t.me/kunuz/100179	2026-09-26 08:14:13.250075
134	jahon	Qozog‘istonda 5 harbiy qo‘lga olindi Kaspiy dengizidagi oʻquv mashgʻuloti chogʻida 14 nafar harbiy xizmatchi halok boʻlishi ortidan Qozogʻiston mudofaa vazirligining besh nafar amaldori hibsga olindi.		https://cdn4.telesco.pe/file/VFCDg0m7Nt-qjWDnIKcNnKmU33fQW2-t-c64iz6gcG51Zz9MHeuhxVmxnkW4WfMKkDsDG1YfC8-xEBi-ihMbmmtc97t_kAyS7l_3wg0I3RM4hcUNG_ugcbjWhNEy28XoqHy1NpTxAqtfPRLgwNW8_jUUHfWWpEci2FJRaxLKIfG3v3RsDgs4KYoe_RMOOl5dTN2NYl1dijAUNwOGlAX3KGXzrXFTeCDfB2IG8Gz-rUBngWO0v9vE7Pt72yrcrnkC9zGbSGMys4UqwxrSZItG32O2QOLi7Fl06sHdqIpvzSpp8DEKH7TDGTM0eNcTaNNWRCXRKOdJAG-R4Xh5n5Ohbw	https://t.me/kunuz/100180	2026-09-26 08:14:13.254994
135	jahon	Suxrob Xo‘jayev Osiyo o‘yinlari chempioni bo‘ldi Bosqon uloqtirish bo‘yicha uchinchi urinishda Osiyo chempioniga aylangan Xo‘jayev O‘zbekiston hisobiga yettinchi oltin medalni taqdim etdi. 👉 https://		https://cdn4.telesco.pe/file/c1PUKD4DtrAKdQUhnfghqmrekAih9r8SawIdbm506H3QpBl2xSJXaqRoPdEpL8TJ0qDblVB7C3KNwGPpgTS4r3ME8PF2uybJ0wVQn_9823XbbiruMiyTD1SajqMfK8yqjxcsY3geJanJMVrv_aoCGIKZ99bkH9Kz4OC6Z8VN4mqXngdbMj5tCHbQL-DIHm721V15DxjA5Mxagkiu4ESRpEP1pOEeRxrgNp2oF-1Mpw3fvq4WJkqKY0up9v5sMHshesoyDNxZ2re1mRVBDLcSN5jschhZdymmyYwXfkglU_qT-Rku911jaM43ToW8Jm9aiTt1FsakbXEMwTdjs6wndA.jpg	https://t.me/kunuz/100181	2026-09-26 08:14:13.26023
136	jahon	Taftish.uz sayti xodimlariga hukm o‘qildi. Ish doirasida 4 nafar DXX zobiti ham ayblangan Qo‘zg‘atilgan jinoyat ishi harbiy sudda yopiq sud majlisida ko‘rib chiqilgan. Sayt xodimlari bilan birga DXXni		https://cdn4.telesco.pe/file/HK5taAaX4SQqiG0HLtwNbGB4OTZkKpFRoxCWbhYTzl9pXybs0iHAATgcmu7va0R1zWtd4m4bBi3hx7Dm6uMhjPCEmNQF1WbMMRm3c2_XupG6PXcSJWl8Hgy8yTI0Luvo4iHl-XcCKUSDO3_QTMOy5gK4p2WUrjIp86VCos0QPNXJvsQ42jQIznTcEowVv3aUxIpA_yMbg85XO5dt9tHw6Fta2np3XXvLZsi6fuTG88lJ7gDCb7wQwAkr42MTM7HE1WCWNgOxShjVA4YEyfo8vaw8fuW3e92XeNnlLPkZ6CcdShTlZ6k-dcD9o_WJ6UwQ5EuKNIa3iWOX931HAzBGSw.jpg	https://t.me/kunuz/100182	2026-09-26 08:14:13.318842
137	jahon	Yagona portalda yangi xizmatlar, madaniy tadbirlarga bepul vaucher va qurilishdagi majburiyat: 1 oktyabrdan nimalar o‘zgaradi? &nbsp; ▪️ moliyaviy jarimani bo‘lib-bo‘lib to‘lash mumkin bo‘ladi; ▪️ ijt		https://cdn4.telesco.pe/file/JhR_LlWX3nGE24RzDI0cidh-vF1ByPQ0PYX6VQezB9VQuiPuZex6EKd-Mz5iwLmADFOBgeSToBO7-YVb4b1DJNgAn_m78BkPu4gIUe4a1fJI4xnsEJV9xz2MkDJ2sZeISSK-lQ-CqTfzUjkZd8tjEB9ZhJGCRj5hBAmetetFUiImqaPL2jwpliSPi4iJmLI4hHx0oBhi3lCmEjM5EcTEXXvwsMrfqSaC8aWJLFQIllUfyJarVO7_jBr-6dZRsm4PukjxKjlaTCXmgIee--u6ApllJdrCDkC2oc07KZcjTWOn2LqsCZMOt5nVdrkrkJPmLgcikG7BN8zgVgAFdbBzIw.jpg	https://t.me/kunuz/100183	2026-09-26 08:14:13.324248
138	jahon	Kechroq pensiyaga chiqqanlarga ko‘proq pul va Konstitutsiyaviy sud himoyasi — mahalliy dayjest ▪️ Kechroq pensiyaga chiqqanlarga ko‘proq pul berish tizimi yaratilishi mumkin. ▪️ Maʼmuriy tartibda 10 s		https://cdn4.telesco.pe/file/CbvbKWxEI4hftCD-VMcucgI9dsOP-0vsFbYfAQ2-F34gnvaa0hKbeE9h0V0mTLryILACNyjs9Hrl5hxGThZKMIimfvml8MLthMwN0iAkqCD3grClQCYZY4o5QWBqUNRv6kd3mFCcAR0P5BfYk8vqsO8GZZ7Bje4EC86l9OIOBEcCfUXiSSR485m8RFqoxNCCmNvdodt-gMp7HG02hfs6zH7k8pt6KV-vHRSceYhWsHWKMdeVOQmRI2oMDETOwHrPbwadqKjhkvObfn8YCZL_v14cpfcnyVei7d7NBDdClgndL4e_X8YKugPmAdcVYrd5br3m_QEKUbJa6osPa9_fSg	https://t.me/kunuz/100184	2026-09-26 08:14:13.329564
139	jahon	Shaxmat olimpiadasi. O‘zbekiston AQShdan ustun keldi O‘zbekistonning asosiy jamoasi 16 ochko bilan peshqadamlikni davom ettirmoqda. O‘zbekiston-2 jamoasi ham Niderlandiya bilan o‘yinda g‘alaba qozondi		https://cdn4.telesco.pe/file/Mj2xdeHnHZUEoJahavznnQQKVZnsBHt2G5oLqQbaTZ6AtpHrL5LxH0QHdqXpVnOCH1ab8TW_hoaw2JMv8eFsJw9uSDwd7ZSlL6yaFHko4NzOvvYRFYrg5Lyf6NceGi5hS7ncEHNvejlnkY1ydGmxBEifKrg88H6CVoz49uYej_vd4-mHsI09CG9ZIIpaM5Ux0TNKWySXRe8l5kiptNuIkDMcAHU2AL-Hz8NVuBYcRHDpCQoWBAbLFJjS9pZi8YnHhvsE1PZFBto-SCZD6z5KWtlR3Vytn50iKtVRvch5ljdM5f3AYb9NyC6MbZPZ-6oVzhfGw1kP2LNYn52bZ_6JnQ.jpg	https://t.me/kunuz/100185	2026-09-26 08:14:13.334645
140	jahon	Open banking nima va u qachondan ishga tushadi? Markaziy bank departament direktori Ravshan Qodirov Open banking tushunchasini taʼriflab, uni ishga tushirish dedlaynlarini ochiqladi. «Open banking - b		https://cdn4.telesco.pe/file/slFopXoGJ_Lpfaslx0imyDHxsk-TKDf3-LhTP8YJuBQtjvUWeRJMZ4DOM7TUiWmOo2ToTsZaJVJBKuHbfDinqsIWUpMbGqY-EIbE7UFr0F0N6CLCdC1YNevVtrny8JMPby6RSjUD-o-Knn0AEEMsplht_IYQ2RV77Jd6AegGRe9RtoFxjXxqgcLvc41KXtVPG5fQYD8vPHfC_sUkgOwmVGRcOECE_zLJMIojkAL5LVkvBzakV9IBfZGqOG80_so8IReqCvnTTmk0Xyhky4gnSlXlPvsEL0LCOOh8rU5XJKzc5dl8BnlxG3BgSIrPmIrBXhBQY6GD_3cMJfq4xsU6GA	https://t.me/kunuz/100186	2026-09-26 08:14:13.340192
141	jahon	«Hali ham SSSR meʼyorlari bilan ishlanyapti»: “Nima dard?”da yoʻl qurilishidagi sifat haqida suhbat Nega yangi asfalt qilingan yoʻl oradan koʻp oʻtmay yana taʼmirtalab boʻlib qoladi? Muammo asfalt sif		https://cdn4.telesco.pe/file/WWrnxIo8AGRyYtL6aCCnpdvyJIZzrBgbYp8xvHHuTfd0duYQKemu2fL1l28HShW9WhmusM7jWn6ouLeGpBQtouJcmHj_3_rR78JTulAnMwyMyfSZGnsklweNzDy19aAJoFd4uYMyUEhcIgMKoLnr8wpin1eQLequ3lXCgy4SARkyu9pzxjK0RgXwGNW0MJaeWSn-wriIKgXAuvx7-XBtCFafKeyZhQbJpnw407cBthxWM2C2NmHl4G9ke2V93n094H_XccgbBXXFrqELR5OsmXEHn2s2q9Ptee6teZPqquuYoVf46dnkbAHL1tyPvHHcKmM7Uu8SEPWsYCn_8ojSLg	https://t.me/kunuz/100187	2026-09-26 08:14:13.345024
142	jahon	Mbappening jarohati Zidanning debyutini buzdi, Xvicha penaltini urolmadi Italiya va Belgiya o‘rtasidagi uchrashuvda ham yangi bosh murabbiylar debyut qildi, Manchini va van Bommel duelida niderlandiya		https://cdn4.telesco.pe/file/p0uyb077v2PWWKtHobbnsTvevKiQQOlEU_pF96c-AnEoTMgV5k7YvKxfBMQnSLXQV7mBycYlqsfl_G-nM1MMDh1bl3xlEIw-omQqP-UDMkXFLf6594nSabOQPisgK9bfAim8FLSkh8vDAeBmAjJqRbH9R2HfDLkfht0J_ajEtO1UngQQEa1cvIWsQ68O3k1qEpWvjgtDEbuiAUWkubdED0hNsv3Hsex-G8a9kipLzkcg6xSNORGB5gLiJVLoK87BfvaA9Rg_ZX7FVjqaHDtDuOkICSaOuHv6qrQnCKVFeWKsDE0Sts_17BKrX5C5f4Z7H2bypnHGDV2CDpRaREnQpg.jpg	https://t.me/kunuz/100189	2026-09-26 08:14:13.350754
143	jahon	O‘qishga kiritish va’dasi: ikki fuqaro va inspektor ushlandi Toshkentda fuqaroni soxta hujjatlar asosida xususiy oliygohning 3-bosqichiga o‘qishga kiritish evaziga 8 ming dollar talab qilish bilan bog		https://cdn4.telesco.pe/file/CRqmL7wzWn0cZAUT8P__xLwzefnsfrLY1D72ygwLkC-r240uhtdbRBa1Lry8DV3PqXgQQrUidCnqDNTcWqd06bTY78bu2Q8x6OebwbSFG4KhZwyJV02dHdi-P9LCmCecwf92HNvt48XEsOp-bjEGv3bdULka2obqW8C7A5a3ER-Y4cqPdtyL7pu2-JeuU-bDqP1oFusfDAy1k4jWNRjYabjH7-qfaPsgT41bQLGScrpFFuvpXE1774z0_czFVgcK8yvR6pKOqK9QmHc1FPz_S3I8m3vE9BSRMqBVT5TW-YI7Si4gj2Vp3RS1VBDhdo5dD2ARHMGBN0y7uSwUvwby7g.jpg	https://t.me/kunuz/100190	2026-09-26 08:14:13.355496
144	jahon	Uchqo‘rg‘on voqeasi ortidan vazirlik barcha davlat bog‘chalarida tekshirish boshladi Maktabgacha va maktab ta’limi vazirligi Namangan viloyatidagi davlat bog‘chasida “zavxoz” 5 yoshli qizaloqni zo‘rla		https://cdn4.telesco.pe/file/MAEwXlkJ0fEK2Bwd9mVChd8SkA-V1M0KGFuo7OgJnNOB_Mwt3Qx9RGNCmnD21EEZptfMlCMwtEFL5Z18MUpaTx2-B-TT5KmAXPuJSBhOWECjvsJBvgxOQVCiUe72kvzkes0mOgXovT57H4brellcfZlZogm90BWNZUMYU4XpRBgRh8BGmEMfJT28u2W-s9YpPWPcJ0oXGeho--Lk0spgJPPSv6AJJzMK8b7tNkiJMlKauBZ_v9C5KTj0GN7zFlfUkB-wUMDfqd6IMCUEysjKznrueI3VaBl2wEgJX9KI2WP8ZEVSoiMCVubovdvn6rkaTM0HJym2Tgj6SlqEgWJALA.jpg	https://t.me/kunuz/100191	2026-09-26 08:14:13.360868
145	jahon	Oʻzbekiston mahallalarida «3–30–300» standarti joriy etiladi Oʻzbekistonda 2026-yil 1-oktabrdan tozalik va ozodalik dolzarb ikki oyligi oʻtkaziladi. 2027-yildan esa «Mahallani yashillashtirish» paketi		https://cdn4.telesco.pe/file/roDb8cVjX1yLoqaaSpkleQiGSEI_fnvw3hYyA6gIMkpCrBGBTbCmkAQ819w3PkxZN431h67eafAEAUG_fRriTUmmwoaoR_LgWuEGl_Sj8fElWRyU-hvhKwVZysANaynVyx0eU-CmuoOgNIdAke2UY-Tu6eLmV6-flarR56zTmBha1nwO5TRZMhgDPDL5TLGEsOwGX7IkxrC9KctF1nBdIsJ8L19hZ5ZYbGUZYHft1zYEnn8cpAnzhwqh3nsHBLOpu1DqwNwt6J8sFgB9LkOaVR2uWHqRN2_xfmV6wy8Qpa_yiX_Cc_cqxUoHDo-AnApiw8Je9tgv0bACHpTmwUTiOA.jpg	https://t.me/kunuz/100192	2026-09-26 08:14:13.365501
146	jahon	Toshkent metrosiga 14 ta zamonaviy poyezd qo‘shildi Toshkent metropolitenida 56 ta yangi vagondan iborat 14 ta zamonaviy poyezd qatnovga qo‘yildi. Natijada metroning vagon parki qariyb 70 foizga yangi		https://cdn4.telesco.pe/file/IKZ2kSJb4CpjvlzGlnOUo-U3KnxsVOCN5k5G3Ixco6fhI5t5tM5jgrd5w7PFDC-ME_jRyYXkTdSBre8f_RXdyaHmHYt5w-NiVddqg5QQHxh0jo_Yw7U3SFqeBDjgge960CSczTA05_Hg8NdDwm9lNSmi9hlwvnICsebfGnsZP3nt5L3cT9FS-ktH3V1p5ZMUGR2I7CgjR66vR1o5Yz072wovJCd5lu1li_9xQqwaWwytClJ-6KsbdnWwCeLZ4QGQvcn_Yt6KMpDWxaQDZHrw8vUU3OvrGesUyTA3wBG9qKLXc9x2FvAKGf5wh-CYDovwYyzORofFj-k6gcCmGJJzMA.jpg	https://t.me/kunuz/100193	2026-09-26 08:14:13.370841
147	jahon	Gaz qimmatlashishi va suv tanqisligi: Moldova favqulodda holatga oʻtdi Moldovada 26-sentabrdan energetika va gidrologiya sohalarida 60 kunlik favqulodda holat joriy etildi. Hukumat qarorini parlament 		https://cdn4.telesco.pe/file/WNO-SFeKJh12YJ0ObSOsiTqq8R76X2tUQw6Mg1EwIY9QjgTuhgDIwAW6OJHUzLNkxl1MxPt9UbfuGygOMBfOG9VMUOzxx4BoshvBe7dpr68bPLdIilIncOm6Kb_P46SjejJe3Q_Lr3e8CgZIDyOnYucdbZBbcd3Stqpe6yCMQsNgrtoCQ9Ti4uPRRevz7UgFvSMzwDP_gfi2vgx5zVLhBCB0IhzltjiX6ZFSLEjZkQRRQPEK9xIOUUpfuCN1W5yY3jRFEDcYOlc8ATUcN2SDrGyxZFIWRqoWYRZOoXAz3JxQU_BXSh1KLLHJ_qittTaDAPEIkaAB89RE2GbUgIr78g.jpg	https://t.me/kunuz/100194	2026-09-26 08:14:13.375843
\.


--
-- Data for Name: restaurant_ratings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.restaurant_ratings (id, restaurant_id, rating, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.restaurants (id, name, category, address, phone, description, created_at) FROM stdin;
136	AGASI FOOD	yarim_tayyor	Bunyodkor 55	+998903277714	Muzlatilgan mahsulotlar	2026-09-26 10:40:22.69143
\.


--
-- Data for Name: service_providers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_providers (id, name, phone, category, description, created_at) FROM stdin;
\.


--
-- Data for Name: service_ratings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_ratings (id, provider_id, rating, created_at) FROM stdin;
\.


--
-- Data for Name: taxi_bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.taxi_bookings (id, ride_id, passenger_name, passenger_phone, created_at, user_id) FROM stdin;
\.


--
-- Data for Name: taxi_drivers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.taxi_drivers (id, name, phone, created_at, user_id) FROM stdin;
1	Test Haydovchi	+998901234567	2026-09-22 11:26:12.741626	\N
\.


--
-- Data for Name: taxi_ratings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.taxi_ratings (id, ride_id, rating, created_at) FROM stdin;
\.


--
-- Data for Name: taxi_rides; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.taxi_rides (id, driver_name, driver_phone, direction, total_seats, booked_seats, status, created_at, user_id) FROM stdin;
\.


--
-- Data for Name: user_views; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_views (user_id, section, last_count, updated_at) FROM stdin;
988368940	events	1	2026-09-26 07:26:37.88304
988368940	news	20	2026-09-26 10:29:47.305268
988368940	oldi_sotdi	0	2026-09-26 10:36:20.552602
\.


--
-- Data for Name: user_views_sub; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_views_sub (user_id, section, subcategory, last_count, updated_at) FROM stdin;
988368940	news	bekobod	0	2026-09-26 08:06:59.882492
988368940	news	jahon	20	2026-09-26 10:29:48.037655
\.


--
-- Name: admin_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_messages_id_seq', 9, true);


--
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ads_id_seq', 6, true);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.books_id_seq', 1, false);


--
-- Name: city_taxi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.city_taxi_id_seq', 5, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 45, true);


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.doctors_id_seq', 6, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.events_id_seq', 4, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.listings_id_seq', 1, false);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.news_id_seq', 152, true);


--
-- Name: restaurant_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.restaurant_ratings_id_seq', 1, false);


--
-- Name: restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.restaurants_id_seq', 136, true);


--
-- Name: service_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_providers_id_seq', 1, false);


--
-- Name: service_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_ratings_id_seq', 1, false);


--
-- Name: taxi_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.taxi_bookings_id_seq', 18, true);


--
-- Name: taxi_drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.taxi_drivers_id_seq', 1, true);


--
-- Name: taxi_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.taxi_ratings_id_seq', 1, false);


--
-- Name: taxi_rides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.taxi_rides_id_seq', 6, true);


--
-- Name: admin_messages admin_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_messages
    ADD CONSTRAINT admin_messages_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (user_id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: bot_users bot_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bot_users
    ADD CONSTRAINT bot_users_pkey PRIMARY KEY (user_id);


--
-- Name: city_taxi city_taxi_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.city_taxi
    ADD CONSTRAINT city_taxi_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: restaurant_ratings restaurant_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.restaurant_ratings
    ADD CONSTRAINT restaurant_ratings_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: service_providers service_providers_phone_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_phone_key UNIQUE (phone);


--
-- Name: service_providers service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_pkey PRIMARY KEY (id);


--
-- Name: service_ratings service_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_ratings
    ADD CONSTRAINT service_ratings_pkey PRIMARY KEY (id);


--
-- Name: taxi_bookings taxi_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_bookings
    ADD CONSTRAINT taxi_bookings_pkey PRIMARY KEY (id);


--
-- Name: taxi_drivers taxi_drivers_phone_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_drivers
    ADD CONSTRAINT taxi_drivers_phone_key UNIQUE (phone);


--
-- Name: taxi_drivers taxi_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_drivers
    ADD CONSTRAINT taxi_drivers_pkey PRIMARY KEY (id);


--
-- Name: taxi_ratings taxi_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_ratings
    ADD CONSTRAINT taxi_ratings_pkey PRIMARY KEY (id);


--
-- Name: taxi_rides taxi_rides_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_rides
    ADD CONSTRAINT taxi_rides_pkey PRIMARY KEY (id);


--
-- Name: user_views user_views_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_views
    ADD CONSTRAINT user_views_pkey PRIMARY KEY (user_id, section);


--
-- Name: user_views_sub user_views_sub_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_views_sub
    ADD CONSTRAINT user_views_sub_pkey PRIMARY KEY (user_id, section, subcategory);


--
-- Name: service_ratings service_ratings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_ratings
    ADD CONSTRAINT service_ratings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.service_providers(id);


--
-- Name: taxi_bookings taxi_bookings_ride_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_bookings
    ADD CONSTRAINT taxi_bookings_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.taxi_rides(id);


--
-- Name: taxi_ratings taxi_ratings_ride_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.taxi_ratings
    ADD CONSTRAINT taxi_ratings_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.taxi_rides(id);


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

\unrestrict 7umH84VgqHfO09oAPJLge0ejg2g7ahXH4PSf8RJMawFEnVKvTrAzfM0vbaFP14e

