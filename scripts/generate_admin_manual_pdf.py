import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717a"))

        # Top Header
        self.drawString(54, 750, "4X4 DEFENDER PARTS — OFFICIAL ADMIN MANUAL")
        self.setStrokeColor(colors.HexColor("#27272a"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Bottom Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential • For Internal Administrative Use Only")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename="docs/4X4_Defender_Parts_Admin_User_Manual.pdf"):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#10b981")     # Emerald Green
    PRIMARY_DARK = colors.HexColor("#047857")
    DARK_BG = colors.HexColor("#18181b")      # Zinc 900
    TEXT_COLOR = colors.HexColor("#27272a")   # Dark text
    TEXT_MUTED = colors.HexColor("#52525b")   # Muted text
    CARD_BG = colors.HexColor("#f4f4f5")      # Light grey card bg
    ACCENT_LINE = colors.HexColor("#10b981")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#09090b"),
        alignment=1, # Center
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY_DARK,
        alignment=1,
    )

    h1_style = ParagraphStyle(
        'ChapterHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#09090b"),
        spaceBefore=14,
        spaceAfter=6,
    )

    h2_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY_DARK,
        spaceBefore=10,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_COLOR,
        leftIndent=14,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#047857"),
        backColor=colors.HexColor("#f4f4f5"),
        borderPadding=4,
        spaceAfter=4,
    )

    story = []

    # ========================== COVER PAGE ==========================
    story.append(Spacer(1, 40))
    if os.path.exists("public/assets/images/logo.jpg"):
        story.append(Image("public/assets/images/logo.jpg", width=1.5*inch, height=1.5*inch))
    story.append(Spacer(1, 20))

    story.append(Paragraph("4X4 DEFENDER PARTS", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("ADMINISTRATOR USER MANUAL &amp; WORKSHOP OPERATIONS GUIDE", title_style))
    story.append(Spacer(1, 12))

    story.append(HRFlowable(width="60%", thickness=2, color=PRIMARY, spaceBefore=10, spaceAfter=20))

    cover_meta = [
        [Paragraph("<b>Website System:</b>", body_style), Paragraph("Team-4x4 E-Commerce &amp; Workshop Management", body_style)],
        [Paragraph("<b>Production URL:</b>", body_style), Paragraph("<u>https://team-4x4.vercel.app</u>", body_style)],
        [Paragraph("<b>Admin Portal:</b>", body_style), Paragraph("<u>https://team-4x4.vercel.app/login</u>", body_style)],
        [Paragraph("<b>System Owner:</b>", body_style), Paragraph("<b>Upul Prajath</b> (Administrator)", body_style)],
        [Paragraph("<b>Documentation Version:</b>", body_style), Paragraph("v1.0 (Production Release)", body_style)],
        [Paragraph("<b>Database:</b>", body_style), Paragraph("PostgreSQL (Vercel Neon Serverless)", body_style)],
    ]
    t_meta = Table(cover_meta, colWidths=[2.0*inch, 3.5*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_meta)

    story.append(Spacer(1, 50))
    if os.path.exists("public/assets/images/hero-bg.jpeg"):
        story.append(Image("public/assets/images/hero-bg.jpeg", width=5.8*inch, height=2.2*inch))

    story.append(PageBreak())

    # ========================== CHAPTER 1 ==========================
    story.append(Paragraph("1. System Overview &amp; Admin Access", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=10))

    story.append(Paragraph(
        "Welcome to the <b>4X4 Defender Parts</b> management system. This platform is custom-built for high-performance Land Rover Defender aftermarket parts retail, frame-off restorations, tactical suspension, custom armor fabrication, cushion upholstery, and complete client order fulfillment.",
        body_style
    ))

    story.append(Paragraph("1.1 Admin Credentials &amp; Login Instructions", h2_style))
    story.append(Paragraph("To access the administrative backend, navigate to the Login page and authenticate with the dedicated administrative credentials:", body_style))

    cred_table = [
        [Paragraph("<b>Portal URL:</b>", body_style), Paragraph("<u>https://team-4x4.vercel.app/login</u>", body_style)],
        [Paragraph("<b>Admin Email:</b>", body_style), Paragraph("<code>upulprajath@gmail.com</code> (or <code>admin@team4x4.lk</code>)", code_style)],
        [Paragraph("<b>Admin Password:</b>", body_style), Paragraph("<code>upulprajath</code> (or <code>upul123</code>)", code_style)],
        [Paragraph("<b>Fast Login:</b>", body_style), Paragraph("Click the <b>'Admin (Upul Prajath)'</b> quick-fill badge on the login screen.", body_style)],
    ]
    t_cred = Table(cred_table, colWidths=[1.8*inch, 3.8*inch])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f4fdf8")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.2 Administrative Navigation Bar", h2_style))
    story.append(Paragraph("Once logged in as Administrator, the top navigation displays an <b>'Admin Portal'</b> button granting instant access to all administrative modules:", body_style))
    story.append(Paragraph("• <b>Dashboard:</b> Overview of revenue, order volume, catalog count, and customer growth.", bullet_style))
    story.append(Paragraph("• <b>Products:</b> Add new parts, manage pricing, upload photos, and update inventory stock.", bullet_style))
    story.append(Paragraph("• <b>Orders:</b> Manage fulfillment (Pending, Confirmed, Shipped, Completed) and delivery addresses.", bullet_style))
    story.append(Paragraph("• <b>Customers:</b> Directory of registered Defender owners, vehicles, phone, and purchase histories.", bullet_style))
    story.append(Paragraph("• <b>Quotations &amp; Invoices:</b> Issue formal custom quotations and generate printable PDF/receipts.", bullet_style))
    story.append(Paragraph("• <b>Services &amp; Gallery:</b> Update workshop restoration services and build showcase portfolios.", bullet_style))

    story.append(Spacer(1, 12))

    # ========================== CHAPTER 2 ==========================
    story.append(Paragraph("2. Products &amp; Inventory Management", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=10))

    story.append(Paragraph(
        "The Products module allows full management of up to 500+ Defender replacement parts and tactical upgrade accessories. All changes sync immediately to the live storefront.",
        body_style
    ))

    story.append(Paragraph("2.1 Adding a New Product (Step-by-Step)", h2_style))
    story.append(Paragraph("1. Go to <b>Admin Portal &gt; Products</b> (<code>/admin/products</code>).", bullet_style))
    story.append(Paragraph("2. Click the <b>'+ Add New Product'</b> button at the top-right.", bullet_style))
    story.append(Paragraph("3. Fill in the required product specifications:", bullet_style))
    story.append(Paragraph("   • <b>Title:</b> Part name (e.g., <i>BP-51 Bypass Suspension Kit</i>).", bullet_style))
    story.append(Paragraph("   • <b>SKU:</b> Unique stock keeping code (e.g., <i>T4X4-BP51</i>).", bullet_style))
    story.append(Paragraph("   • <b>Category:</b> Performance, Exterior, Interior &amp; Cushion, Lighting, Recovery, Intake, etc.", bullet_style))
    story.append(Paragraph("   • <b>Price (LKR):</b> Retail selling price in Sri Lankan Rupees.", bullet_style))
    story.append(Paragraph("   • <b>Stock Quantity:</b> Available inventory count. Setting below 5 displays <i>'Low Stock'</i> automatically.", bullet_style))
    story.append(Paragraph("   • <b>Compatibility:</b> List supported vehicles (e.g., <i>Defender 90/110/130 TD5, Puma</i>).", bullet_style))
    story.append(Paragraph("   • <b>Features:</b> Separate key highlights with vertical bars (e.g., <i>TIG Welded|6mm Steel|Bolt-on</i>).", bullet_style))
    story.append(Paragraph("4. <b>Upload Photos:</b> Choose primary photo and optional secondary gallery photos.", bullet_style))
    story.append(Paragraph("5. Click <b>'Save Product'</b> to publish directly to the live catalog.", bullet_style))

    story.append(Spacer(1, 8))

    prod_images = []
    if os.path.exists("public/assets/images/green-suspension.jpg") and os.path.exists("public/assets/images/fabrication.jpg"):
        row = [
            Image("public/assets/images/green-suspension.jpg", width=2.6*inch, height=1.5*inch),
            Image("public/assets/images/fabrication.jpg", width=2.6*inch, height=1.5*inch)
        ]
        t_img = Table([row], colWidths=[2.8*inch, 2.8*inch])
        t_img.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
        story.append(t_img)
        story.append(Paragraph("<i>Figure 2.1: Sample tactical parts showcase (Suspension Coilovers &amp; Custom Bumper Armor)</i>", ParagraphStyle('Cap', parent=body_style, fontSize=8, textColor=TEXT_MUTED, alignment=1)))

    story.append(PageBreak())

    # ========================== CHAPTER 3 ==========================
    story.append(Paragraph("3. Orders &amp; Fulfillment Workflow", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=10))

    story.append(Paragraph(
        "When a customer places an order via the Storefront or WhatsApp, the order is registered under the Orders database with real-time customer and vehicle details.",
        body_style
    ))

    story.append(Paragraph("3.1 Order Status Lifecycle", h2_style))
    
    status_data = [
        [Paragraph("<b>Status</b>", body_style), Paragraph("<b>Description</b>", body_style), Paragraph("<b>Action Required</b>", body_style)],
        [Paragraph("<font color='#d97706'><b>pending</b></font>", body_style), Paragraph("New order received. Awaiting bank slip or WhatsApp confirmation.", body_style), Paragraph("Verify payment and contact customer.", body_style)],
        [Paragraph("<font color='#0284c7'><b>confirmed</b></font>", body_style), Paragraph("Payment verified. Parts allocated in workshop inventory.", body_style), Paragraph("Prepare parts for packing / installation.", body_style)],
        [Paragraph("<font color='#7c3aed'><b>shipped</b></font>", body_style), Paragraph("Dispatched with islandwide courier / garage delivery service.", body_style), Paragraph("Share tracking info with client.", body_style)],
        [Paragraph("<font color='#059669'><b>completed</b></font>", body_style), Paragraph("Delivered or picked up at workshop successfully.", body_style), Paragraph("Order fulfilled and archived.", body_style)],
        [Paragraph("<font color='#dc2626'><b>cancelled</b></font>", body_style), Paragraph("Order voided or customer requested change.", body_style), Paragraph("Stock automatically released.", body_style)],
    ]
    t_status = Table(status_data, colWidths=[1.1*inch, 2.8*inch, 1.8*inch])
    t_status.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e4e4e7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#d4d4d8")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_status)

    story.append(Spacer(1, 12))

    # ========================== CHAPTER 4 ==========================
    story.append(Paragraph("4. Customer Database &amp; Inquiries", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=10))

    story.append(Paragraph(
        "The Customers module records every registered client across Sri Lanka. You can inspect customer contact info, delivery districts, registered 4x4 vehicle models (Defender 90/110/130), and total completed orders.",
        body_style
    ))

    story.append(Paragraph("• <b>Direct WhatsApp / Phone Action:</b> One-click WhatsApp link directly opens a chat with the customer pre-filled with order details.", bullet_style))
    story.append(Paragraph("• <b>Vehicle History Tracking:</b> Keep records of client modifications, parts installed, and service dates.", bullet_style))
    story.append(Paragraph("• <b>Search &amp; Filter:</b> Rapidly find customers by Name, Email, Phone number, or Vehicle model.", bullet_style))

    story.append(Spacer(1, 10))

    if os.path.exists("public/assets/images/restoration.png") and os.path.exists("public/assets/images/cushion.jpg"):
        row = [
            Image("public/assets/images/restoration.png", width=2.6*inch, height=1.5*inch),
            Image("public/assets/images/cushion.jpg", width=2.6*inch, height=1.5*inch)
        ]
        t_img2 = Table([row], colWidths=[2.8*inch, 2.8*inch])
        t_img2.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
        story.append(t_img2)
        story.append(Paragraph("<i>Figure 4.1: Frame-Off Restoration projects and Custom Leather Cushion Works</i>", ParagraphStyle('Cap2', parent=body_style, fontSize=8, textColor=TEXT_MUTED, alignment=1)))

    story.append(PageBreak())

    # ========================== CHAPTER 5 ==========================
    story.append(Paragraph("5. Quotations, Invoices &amp; Workshop Services", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=10))

    story.append(Paragraph("5.1 Custom Quotation Generator", h2_style))
    story.append(Paragraph(
        "For custom fabrication, engine overhauls, or full builds, generate formal quotations with itemized labor, parts pricing, and validity periods. Quotations can be converted to PDF and shared via WhatsApp or Email.",
        body_style
    ))

    story.append(Paragraph("5.2 Workshop Services &amp; Build Portfolio", h2_style))
    story.append(Paragraph("You can edit, add, or customize workshop service categories directly:", body_style))
    story.append(Paragraph("1. <b>Frame-Off Restoration:</b> Chassis overhaul, corrosion treatment, drivetrain rebuilds.", bullet_style))
    story.append(Paragraph("2. <b>Tactical Suspension:</b> BP-51 bypass dampers, coil conversions, geometry alignment.", bullet_style))
    story.append(Paragraph("3. <b>Armor &amp; Fabrication:</b> Rock sliders, heavy-duty winch bumpers, underbody skid plates.", bullet_style))
    story.append(Paragraph("4. <b>High-Output Lumens:</b> Military-grade 50-inch arc LED arrays and waterproof switch pods.", bullet_style))
    story.append(Paragraph("5. <b>Winch &amp; Recovery:</b> Warn Zeon winches, synthetic ropes, chassis anchor points.", bullet_style))
    story.append(Paragraph("6. <b>Cushion Works:</b> Marine-grade custom leather upholstery, ergonomic seat contouring, roof liners.", bullet_style))

    story.append(Spacer(1, 14))

    # ========================== CHAPTER 6 ==========================
    story.append(Paragraph("6. Security, Maintenance &amp; Handover Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=4, spaceAfter=10))

    summary_box = [
        [Paragraph("<b>Production Hosting:</b>", body_style), Paragraph("Vercel Global Edge Network (High Availability)", body_style)],
        [Paragraph("<b>Database Engine:</b>", body_style), Paragraph("Neon Serverless PostgreSQL (100% Free Forever native tier)", body_style)],
        [Paragraph("<b>Automated Backups:</b>", body_style), Paragraph("Included automatically in cloud database storage.", body_style)],
        [Paragraph("<b>Admin Contact:</b>", body_style), Paragraph("Upul Prajath (<u>upulprajath@gmail.com</u>)", body_style)],
        [Paragraph("<b>Developer Support:</b>", body_style), Paragraph("Team-4x4 Engineering Suite", body_style)],
    ]
    t_sum = Table(summary_box, colWidths=[2.0*inch, 3.6*inch])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_sum)

    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>End of User Manual • 4X4 DEFENDER PARTS © 2026</b>", ParagraphStyle('End', parent=body_style, alignment=1, textColor=TEXT_MUTED, fontSize=9)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ User manual successfully generated at: {filename}")

if __name__ == "__main__":
    build_pdf()
