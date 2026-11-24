# Uniqueen Interiors — Client Portal

One website for your studio and every client. Each client logs in and sees **only their own project**; you log in and see everything.

## The sections in each project

| Section | Client can | You (admin) can |
| --- | --- | --- |
| Overview | See their stage, the amount paid, the balance, the latest update and a to-do list | Edit the stage, status, dates, and the client's name and phone |
| Welcome guide | Read your process, timeline, deliverables and payment schedule; print it | Same |
| Questionnaire | Fill it in, save a draft, submit it and edit it later | Read their answers or fill the questionnaire in for them |
| Updates | Read every update from the studio | Post and delete updates |
| Invoices & payments | View and print invoices; **pay online with Flutterwave** or by bank transfer | Create invoices, record bank transfers, mark invoices paid or cancelled |
| Orders | Track every furniture and décor order, its status and delivery date | Add orders and update payments, status and dates |
| Costing (BOQ) | See the Bill of Quantities, section by section | Add or remove BOQ lines |

The **studio dashboard** (`/admin`) lists every client and project, shows what each client owes, and has the form for adding a new client.

---

## Set it up (about 30 minutes, free to start)

### 1. Supabase (the database and logins)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste everything in `supabase/schema.sql` and click **Run**.
3. Go to **Authentication → Users → Add user → Create new user**. Enter *your* email, tick **Auto Confirm User** and click Create.
4. Back in **SQL Editor**, run this with your email to make yourself the admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'your@email.com';
   ```
5. Go to **Project Settings → API** and copy the **Project URL**, the **anon public** key and the **service_role** key.

### 2. Flutterwave (payments)
1. Create an account at [flutterwave.com](https://flutterwave.com) and complete the business verification so you can accept live payments.
2. Go to **Settings → API Keys** and copy your **Secret key**. Start with the **Test** key.
3. Go to **Settings → Webhooks**. Set the URL to `https://YOUR-SITE/api/flutterwave/webhook` (you get this address in step 3), make up a long random **Secret hash**, and save.

### 3. Put it online (Vercel, free)
1. Upload this folder to a new **GitHub** repository. `.env.local` is ignored, so your keys stay private.
2. At [vercel.com](https://vercel.com), choose **Add New → Project** and import the repository.
3. Under **Environment Variables**, add every line from `.env.example` with your real values. Set `NEXT_PUBLIC_SITE_URL` to your Vercel address, e.g. `https://uniqueen-interiors.vercel.app`.
4. Click **Deploy**.
5. Back in Supabase, go to **Authentication → URL Configuration**:
   - **Site URL**: your website address
   - **Redirect URLs**: add `https://YOUR-SITE/auth/callback`

### 4. Your own domain (later)
Buy `uniqueeninteriors.com` from any registrar (e.g. Namecheap or Whogohost), then add it in **Vercel → Project → Settings → Domains** and follow the DNS steps there. Afterwards, update `NEXT_PUBLIC_SITE_URL`, the Supabase URL settings and the Flutterwave webhook URL to use the new domain.

---

## Daily use
1. Open your site and click **Client login**. Enter your email and click the link that arrives. You land on the **dashboard**.
2. **Add a new client project** with the client's name, email, phone and project name.
3. Send the client your website link on WhatsApp. They log in with the same email.
4. As the project moves, change the **stage**, post **updates**, add **orders** and **BOQ** lines, and create **invoices**. The client sees every change the next time they open the portal.

## Testing payments
While `FLW_SECRET_KEY` is a **test** key, use Flutterwave's test cards (listed in their docs under *Testing helpers*); no real money moves. When everything works, switch to the **live** key in Vercel and redeploy.

## Good to know
- Supabase's built-in email sender allows only a few login emails per hour. Before you have many clients, connect your own email service in **Supabase → Authentication → Emails → SMTP Settings** (for example Resend or Brevo, which have free tiers).
- Never share the `SUPABASE_SERVICE_ROLE_KEY` or `FLW_SECRET_KEY`.
- To run the site on your own computer: `npm install`, copy `.env.example` to `.env.local` and fill it in, then run `npm run dev` and open http://localhost:3000.
