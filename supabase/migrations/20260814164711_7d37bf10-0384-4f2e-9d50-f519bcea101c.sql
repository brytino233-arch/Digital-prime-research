
CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text NOT NULL,
  location text NOT NULL DEFAULT 'Accra, Ghana',
  website text,
  instagram text,
  facebook text,
  tiktok text,
  phone text,
  email text,
  operating_status text NOT NULL DEFAULT 'Not verified',
  score_total integer NOT NULL DEFAULT 0,
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  strongest_opportunity text,
  best_contact_channel text,
  why_it_matters text,
  recommended_offer text,
  price_range text,
  research_status text NOT NULL DEFAULT 'RESEARCHED',
  pipeline_status text NOT NULL DEFAULT 'RESEARCHED',
  is_demo boolean NOT NULL DEFAULT true,
  archived boolean NOT NULL DEFAULT false,
  last_researched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.research_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  research_goal text NOT NULL DEFAULT 'Find most likely to buy',
  provider text NOT NULL DEFAULT 'mock',
  digital_presence jsonb NOT NULL DEFAULT '[]'::jsonb,
  customer_journey jsonb NOT NULL DEFAULT '[]'::jsonb,
  bottlenecks jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_offer jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  source_url text,
  source_type text NOT NULL DEFAULT 'Not verified',
  claim text NOT NULL,
  classification text NOT NULL DEFAULT 'OBSERVATION',
  confidence text NOT NULL DEFAULT 'Medium',
  date_checked date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.decision_makers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  public_profile text,
  contact_route text,
  confidence text NOT NULL DEFAULT 'Low',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  title text NOT NULL,
  impact text NOT NULL DEFAULT 'Medium',
  difficulty text NOT NULL DEFAULT 'Medium',
  solution text,
  why_it_fits text,
  rank integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  name text NOT NULL,
  website_note text,
  booking_note text,
  pricing_note text,
  ux_note text,
  search_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.outreach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  target text,
  channel text,
  opening text,
  problem text,
  value text,
  cta text,
  follow_up text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.proof_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pipeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_prospect ON public.evidence(prospect_id);
CREATE INDEX idx_opportunities_prospect ON public.opportunities(prospect_id);
CREATE INDEX idx_competitors_prospect ON public.competitors(prospect_id);
CREATE INDEX idx_decision_makers_prospect ON public.decision_makers(prospect_id);
CREATE INDEX idx_reports_prospect ON public.research_reports(prospect_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_reports TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_makers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outreach_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proof_packs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline_events TO anon, authenticated;
GRANT ALL ON public.prospects, public.research_reports, public.evidence, public.decision_makers,
  public.opportunities, public.competitors, public.outreach_messages, public.proof_packs,
  public.pipeline_events TO service_role;

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "internal tool full access" ON public.prospects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.research_reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.evidence FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.decision_makers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.opportunities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.competitors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.outreach_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.proof_packs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "internal tool full access" ON public.pipeline_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER prospects_touch BEFORE UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ------------------- DEMO SEED (clearly flagged is_demo = true) -------------------

INSERT INTO public.prospects (id, name, industry, location, website, instagram, phone, operating_status,
  score_total, score_breakdown, strongest_opportunity, best_contact_channel, why_it_matters,
  recommended_offer, price_range, pipeline_status, is_demo) VALUES
('11111111-1111-4111-8111-111111111111','Lumen Beauty Atelier (demo)','Beauty & Wellness','Accra','https://example.com/lumen','@lumen.beauty.demo','+233 20 000 0001','Not verified',
 87,'{"digitalNeed":18,"abilityToPay":16,"decisionMakerAccess":13,"easeOfProof":13,"activityGrowth":9,"brandQuality":9,"offerFit":9}',
 'Online booking + service discovery','Instagram',
 'Demo profile: a premium-looking salon brand with an active social presence but a manual, DM-based booking journey.',
 'High-Conversion Booking Experience','GHS 2,500-4,000','RESEARCHED',true),
('22222222-2222-4222-8222-222222222222','Kpakpo Kitchen (demo)','Restaurants & Hospitality','Accra','https://example.com/kpakpo','@kpakpo.kitchen.demo','+233 20 000 0002','Not verified',
 81,'{"digitalNeed":17,"abilityToPay":14,"decisionMakerAccess":12,"easeOfProof":13,"activityGrowth":8,"brandQuality":8,"offerFit":9}',
 'Digital menu + reservation flow','WhatsApp',
 'Demo profile: strong walk-in demand signals, but menu and reservations live only in social posts.',
 'Menu & Reservation Microsite','GHS 2,000-3,500','RESEARCHED',true),
('33333333-3333-4333-8333-333333333333','Ridge Strength Collective (demo)','Fitness & Wellness','Accra','https://example.com/ridge','@ridge.strength.demo','+233 20 000 0003','Not verified',
 76,'{"digitalNeed":15,"abilityToPay":13,"decisionMakerAccess":11,"easeOfProof":12,"activityGrowth":8,"brandQuality":9,"offerFit":8}',
 'Membership pricing clarity + trial signup','Instagram',
 'Demo profile: clear brand identity, but membership tiers and trial signup are not visible online.',
 'Membership Conversion Page','GHS 1,800-3,000','RESEARCHED',true),
('44444444-4444-4444-8444-444444444444','Adinkra Thread Studio (demo)','Fashion & Retail','Accra','https://example.com/adinkra','@adinkra.thread.demo','+233 20 000 0004','Not verified',
 72,'{"digitalNeed":15,"abilityToPay":12,"decisionMakerAccess":10,"easeOfProof":11,"activityGrowth":8,"brandQuality":9,"offerFit":7}',
 'Made-to-measure order flow','Instagram',
 'Demo profile: distinctive design work with orders handled through comments and DMs.',
 'Bespoke Order Experience','GHS 2,200-3,800','RESEARCHED',true),
('55555555-5555-4555-8555-555555555555','Cantonments Property Partners (demo)','Real Estate','Accra','https://example.com/cpp','@cpp.demo','+233 20 000 0005','Not verified',
 68,'{"digitalNeed":13,"abilityToPay":16,"decisionMakerAccess":9,"easeOfProof":10,"activityGrowth":7,"brandQuality":6,"offerFit":7}',
 'Listing search + viewing requests','Email',
 'Demo profile: high transaction values, but listings are hard to browse and enquiries lack a clear route.',
 'Listing Discovery Platform','GHS 4,000-7,500','RESEARCHED',true);

INSERT INTO public.decision_makers (prospect_id, name, role, public_profile, contact_route, confidence) VALUES
('11111111-1111-4111-8111-111111111111','Demo contact — not verified','Founder / Creative Director','Not verified','Instagram DM','Low'),
('22222222-2222-4222-8222-222222222222','Demo contact — not verified','Owner','Not verified','WhatsApp Business','Low'),
('33333333-3333-4333-8333-333333333333','Demo contact — not verified','Head Coach / Owner','Not verified','Instagram DM','Low'),
('44444444-4444-4444-8444-444444444444','Demo contact — not verified','Designer / Founder','Not verified','Instagram DM','Low'),
('55555555-5555-4555-8555-555555555555','Demo contact — not verified','Managing Partner','Not verified','Email','Low');

INSERT INTO public.evidence (prospect_id, source_name, source_url, source_type, claim, classification, confidence) VALUES
('11111111-1111-4111-8111-111111111111','Demo dataset','https://example.com/lumen','Demo record','Business operates a salon brand in Accra.','OBSERVATION','Medium'),
('11111111-1111-4111-8111-111111111111','Demo dataset',NULL,'Demo record','Bookings appear to be arranged through direct messages rather than a booking tool.','OBSERVATION','Medium'),
('11111111-1111-4111-8111-111111111111','Demo dataset',NULL,'Demo record','A structured booking flow could reduce back-and-forth for enquiries.','INFERENCE','Low'),
('22222222-2222-4222-8222-222222222222','Demo dataset','https://example.com/kpakpo','Demo record','Menu items are published as social posts.','OBSERVATION','Medium'),
('22222222-2222-4222-8222-222222222222','Demo dataset',NULL,'Demo record','No reservation link is visible on public profiles.','OBSERVATION','Medium'),
('22222222-2222-4222-8222-222222222222','Demo dataset',NULL,'Demo record','A browsable menu may help customers decide before arriving.','INFERENCE','Low'),
('33333333-3333-4333-8333-333333333333','Demo dataset','https://example.com/ridge','Demo record','Gym publishes class content regularly on social media.','OBSERVATION','Medium'),
('33333333-3333-4333-8333-333333333333','Demo dataset',NULL,'Demo record','Membership pricing is not published publicly.','OBSERVATION','Medium'),
('33333333-3333-4333-8333-333333333333','Demo dataset',NULL,'Demo record','Visible pricing tiers may shorten the decision step for new members.','INFERENCE','Low'),
('44444444-4444-4444-8444-444444444444','Demo dataset','https://example.com/adinkra','Demo record','Studio showcases original designs on social media.','OBSERVATION','Medium'),
('44444444-4444-4444-8444-444444444444','Demo dataset',NULL,'Demo record','Orders are requested in comments and direct messages.','OBSERVATION','Medium'),
('44444444-4444-4444-8444-444444444444','Demo dataset',NULL,'Demo record','A guided order form could make measurements and timelines clearer.','INFERENCE','Low'),
('55555555-5555-4555-8555-555555555555','Demo dataset','https://example.com/cpp','Demo record','Agency lists residential properties in Accra.','OBSERVATION','Medium'),
('55555555-5555-4555-8555-555555555555','Demo dataset',NULL,'Demo record','Listings are not filterable on the public site.','OBSERVATION','Medium'),
('55555555-5555-4555-8555-555555555555','Demo dataset',NULL,'Demo record','Search and filtering may help buyers self-qualify before enquiring.','INFERENCE','Low');

INSERT INTO public.opportunities (prospect_id, title, impact, difficulty, solution, why_it_fits, rank) VALUES
('11111111-1111-4111-8111-111111111111','Self-serve appointment booking','High','Medium','Booking experience with service menu, durations and deposits','The brand already attracts interest socially; the booking step is the manual part.',1),
('11111111-1111-4111-8111-111111111111','Service and price discovery','Medium','Low','Structured service menu page','Reduces repeated questions about services and pricing.',2),
('22222222-2222-4222-8222-222222222222','Browsable digital menu','High','Low','Fast menu microsite with categories and photography','Menu discovery currently depends on scrolling social posts.',1),
('22222222-2222-4222-8222-222222222222','Table reservation route','Medium','Medium','Reservation form connected to WhatsApp','Gives a clear next step for people who are ready to visit.',2),
('33333333-3333-4333-8333-333333333333','Published membership tiers','High','Low','Membership page with tiers and trial signup','Pricing clarity supports the decision stage of the journey.',1),
('33333333-3333-4333-8333-333333333333','Trial class signup','Medium','Medium','Trial signup flow with reminders','Converts interest from social content into visits.',2),
('44444444-4444-4444-8444-444444444444','Guided bespoke order flow','High','Medium','Order experience capturing style, measurements and timeline','Removes ambiguity in custom orders handled over DM.',1),
('44444444-4444-4444-8444-444444444444','Lookbook with clear pricing bands','Medium','Low','Lookbook pages with indicative pricing','Helps buyers self-qualify before contacting the studio.',2),
('55555555-5555-4555-8555-555555555555','Searchable listing experience','High','High','Listing platform with filters and viewing requests','High-value transactions justify a stronger discovery experience.',1),
('55555555-5555-4555-8555-555555555555','Viewing request flow','Medium','Medium','Viewing request form with qualification questions','Creates a clear route from listing to conversation.',2);

INSERT INTO public.competitors (prospect_id, name, website_note, booking_note, pricing_note, ux_note, search_note) VALUES
('11111111-1111-4111-8111-111111111111','Demo competitor A','Dedicated site','Online booking available','Prices published','Mobile-friendly','Appears in local search'),
('11111111-1111-4111-8111-111111111111','Demo competitor B','Social only','DM only','Not published','Not verified','Limited'),
('22222222-2222-4222-8222-222222222222','Demo competitor A','Dedicated site','Reservation form','Menu prices published','Mobile-friendly','Appears in local search'),
('22222222-2222-4222-8222-222222222222','Demo competitor B','Landing page','Phone only','Partially published','Not verified','Limited'),
('33333333-3333-4333-8333-333333333333','Demo competitor A','Dedicated site','Trial signup online','Tiers published','Mobile-friendly','Appears in local search'),
('33333333-3333-4333-8333-333333333333','Demo competitor B','Social only','DM only','Not published','Not verified','Limited'),
('44444444-4444-4444-8444-444444444444','Demo competitor A','Online store','Order form','Prices published','Mobile-friendly','Appears in local search'),
('44444444-4444-4444-8444-444444444444','Demo competitor B','Social only','DM only','Not published','Not verified','Limited'),
('55555555-5555-4555-8555-555555555555','Demo competitor A','Listing portal','Viewing request form','Prices published','Filterable search','Strong local search presence'),
('55555555-5555-4555-8555-555555555555','Demo competitor B','Basic site','Phone only','On request','Not verified','Limited');

INSERT INTO public.research_reports (prospect_id, research_goal, provider, digital_presence, customer_journey, bottlenecks, recommended_offer)
SELECT p.id, 'Find most likely to buy', 'mock',
  jsonb_build_array(
    jsonb_build_object('label','Website','status', CASE WHEN p.website IS NULL THEN 'Not verified' ELSE 'Present (demo record)' END,'note','Demo dataset record, not live research.'),
    jsonb_build_object('label','Mobile experience','status','Not verified','note','Requires live audit.'),
    jsonb_build_object('label','Social presence','status','Active (demo record)','note','Regular posting observed in demo dataset.'),
    jsonb_build_object('label','Booking','status','Manual (demo record)','note','Handled through messaging in demo dataset.'),
    jsonb_build_object('label','Service menu','status','Partial','note','Published informally.'),
    jsonb_build_object('label','Pricing visibility','status','Not published','note','No public pricing in demo dataset.'),
    jsonb_build_object('label','Contact flow','status','Single channel','note','Primary route is ' || COALESCE(p.best_contact_channel,'Not verified') || '.'),
    jsonb_build_object('label','Search visibility','status','Not verified','note','Requires live search audit.')),
  jsonb_build_array(
    jsonb_build_object('stage','DISCOVERY','current','Customers find the business through social media and word of mouth.','evidence','Demo dataset observation','friction','Low'),
    jsonb_build_object('stage','INFORMATION','current','Details about services and pricing are spread across posts.','evidence','Demo dataset observation','friction','Medium'),
    jsonb_build_object('stage','DECISION','current','Customers ask questions before they can decide.','evidence','Demo dataset observation','friction','Medium'),
    jsonb_build_object('stage','BOOKING','current','Booking or ordering happens over direct messages.','evidence','Demo dataset observation','friction','High'),
    jsonb_build_object('stage','CONFIRMATION','current','Confirmation is manual and unstructured.','evidence','Not verified','friction','Medium')),
  jsonb_build_array(
    jsonb_build_object('rank',1,'problem','No structured booking or ordering route','evidence','Demo dataset observation','classification','OBSERVATION','impact','Enquiries require manual handling before they convert.','confidence','Medium'),
    jsonb_build_object('rank',2,'problem','Pricing and service information not consolidated','evidence','Demo dataset observation','classification','OBSERVATION','impact','Customers need extra steps to understand the offer.','confidence','Medium'),
    jsonb_build_object('rank',3,'problem','Search visibility unconfirmed','evidence','Not verified','classification','INFERENCE','impact','Potential discovery gap outside social platforms.','confidence','Low')),
  jsonb_build_object('name', p.recommended_offer,
    'build','A focused digital experience covering discovery, information and the booking or enquiry step.',
    'whyItFits','The demo record suggests strong demand signals with a manual conversion step.',
    'priceRange', p.price_range,
    'proofConcept','A single-screen redesign of the current conversion step.',
    'outreachAngle','Open with genuine appreciation for their work, then offer a short look at the booking journey.')
FROM public.prospects p;
