#!/usr/bin/env python3
"""
Generate a demo underwriting PDF for GroupaIQ — Souscription Complémentaire Santé.

Creates a realistic French health insurance subscription request with:
- Client email requesting Complémentaire Santé
- Health questionnaire with pre-existing conditions
- List of attached documents

Usage:
    python scripts/generate_demo_underwriting.py
    # Output: assets/demo/souscription-sante-lefevre.pdf
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF required: uv add pymupdf")
    sys.exit(1)


def generate_underwriting_pdf():
    output_dir = Path("assets/demo")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "souscription-sante-lefevre.pdf"

    doc = fitz.open()

    # ─── Page 1: Email du client + Demande de souscription ─────
    page = doc.new_page(width=595, height=842)

    logo_path = Path("assets/logo_vert_fr.png")
    if logo_path.exists():
        page.insert_image(fitz.Rect(40, 30, 220, 80), filename=str(logo_path))

    page.insert_text((40, 110), "DEMANDE DE SOUSCRIPTION", fontsize=16,
                     fontname="helv", color=(0, 0.41, 0.32))
    page.insert_text((40, 128), "Complementaire Sante — Formule Equilibre Plus", fontsize=10,
                     fontname="helv", color=(0.4, 0.4, 0.4))
    page.draw_line((40, 138), (555, 138), color=(0, 0.41, 0.32), width=1.5)

    y = 155
    lh = 14
    sg = 20

    def title(text, yp):
        page.insert_text((40, yp), text, fontsize=11, fontname="helv", color=(0, 0.41, 0.32))
        page.draw_line((40, yp + 4), (555, yp + 4), color=(0.85, 0.85, 0.85), width=0.5)
        return yp + sg

    def fld(label, value, yp, xv=200):
        page.insert_text((50, yp), label, fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((xv, yp), value, fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
        return yp + lh

    # Email block
    page.draw_rect(fitz.Rect(40, y - 5, 555, y + 75), color=(0.95, 0.95, 0.95), fill=(0.97, 0.97, 0.97))
    page.insert_text((50, y + 8), "De : antoine.lefevre@cuisine-bordeaux.fr", fontsize=8, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((50, y + 20), "A : souscription@groupama-ca.fr", fontsize=8, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((50, y + 32), "Date : 25 mars 2026", fontsize=8, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((50, y + 44), "Objet : Demande de souscription Complementaire Sante — LEFEVRE Antoine", fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))

    email_text = (
        "Bonjour,\n\n"
        "Suite a notre entretien telephonique du 20 mars, je souhaite souscrire a votre\n"
        "offre Complementaire Sante formule Equilibre Plus pour moi-meme.\n\n"
        "Je suis chef cuisinier independant, 48 ans, et je cherche une couverture\n"
        "complete incluant hospitalisation, optique et dentaire renforcee.\n\n"
        "Je vous joins mon questionnaire de sante complete, ainsi que :\n"
        "- Ma carte d'identite (scan)\n"
        "- Mon attestation de Securite Sociale (regime general)\n"
        "- Mon RIB pour le prelevement des cotisations\n"
        "- Ma derniere ordonnance medicale (traitement hypertension)\n"
        "- Mes derniers resultats d'analyses sanguines (mars 2026)\n\n"
        "Je reste disponible pour tout complement d'information.\n"
        "Cordialement, Antoine LEFEVRE"
    )
    rect = fitz.Rect(50, y + 58, 545, y + 200)
    page.insert_textbox(rect, email_text, fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))
    y += 215

    # Informations personnelles
    y = title("INFORMATIONS DU SOUSCRIPTEUR", y)
    y = fld("Nom et prenom :", "LEFEVRE Antoine", y)
    y = fld("Date de naissance :", "12 septembre 1977 (48 ans)", y)
    y = fld("Adresse :", "7 place du Marche, 33000 Bordeaux", y)
    y = fld("Telephone :", "06 87 65 43 21", y)
    y = fld("Email :", "antoine.lefevre@cuisine-bordeaux.fr", y)
    y = fld("N Securite Sociale :", "1 77 09 33 063 234 67", y)
    y = fld("Profession :", "Chef cuisinier independant (TNS)", y)
    y = fld("Regime SS :", "Regime general — CPAM Gironde", y)
    y += 8

    # Couverture demandee
    y = title("COUVERTURE DEMANDEE", y)
    y = fld("Formule :", "Equilibre Plus (hospitalisation + soins courants + optique + dentaire)", y)
    y = fld("Date d'effet :", "01/05/2026", y)
    y = fld("Beneficiaires :", "Souscripteur seul (pas d'ayants droit)", y)
    y = fld("Cotisation estimee :", "127,00 EUR / mois (indication, sous reserve d'acceptation)", y)
    y = fld("Mode de paiement :", "Prelevement mensuel — RIB joint", y)
    y += 8

    # Antecedents medicaux (resume)
    y = title("RESUME MEDICAL (voir questionnaire page 2)", y)
    y = fld("Taille / Poids :", "178 cm / 86 kg (IMC 27.2 — surpoids leger)", y)
    y = fld("Tabac :", "Ancien fumeur (arrete en 2021, 15 paquets/an avant)", y)
    y = fld("Alcool :", "Consommation moderee (professionnel de la restauration)", y)
    y = fld("Pathologie en cours :", "Hypertension arterielle controlee sous traitement", y)
    y = fld("Traitement actuel :", "Amlodipine 5mg — 1 cp/jour depuis 2022", y)
    y = fld("ATCD familiaux :", "Pere : diabete type 2 diagnostique a 55 ans", y)
    y = fld("Hospitalisation :", "Appendicectomie en 2005 (sans complications)", y)
    y = fld("Arret de travail :", "15 jours en 2024 (entorse cheville — accident cuisine)", y)

    # Footer
    page.insert_text((40, 800), "Groupama Centre-Atlantique — Service Souscription Sante", fontsize=7, fontname="helv", color=(0.5, 0.5, 0.5))
    page.insert_text((440, 800), "Page 1/2", fontsize=7, fontname="helv", color=(0.5, 0.5, 0.5))

    # ─── Page 2: Questionnaire de sante detaille ───────────────
    page2 = doc.new_page(width=595, height=842)

    if logo_path.exists():
        page2.insert_image(fitz.Rect(40, 30, 220, 80), filename=str(logo_path))

    page2.insert_text((40, 110), "QUESTIONNAIRE DE SANTE", fontsize=16, fontname="helv", color=(0, 0.41, 0.32))
    page2.insert_text((40, 128), "Souscripteur : LEFEVRE Antoine — Ne le 12/09/1977", fontsize=9, fontname="helv", color=(0.4, 0.4, 0.4))
    page2.draw_line((40, 138), (555, 138), color=(0, 0.41, 0.32), width=1.5)

    y2 = 160
    q_num = 0

    def question(num, text, answer, detail, yp):
        page2.insert_text((50, yp), f"Q{num}.", fontsize=9, fontname="helv", color=(0, 0.41, 0.32))
        page2.insert_text((75, yp), text, fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))
        ans_color = (0.8, 0.0, 0.0) if answer == "OUI" else (0.0, 0.5, 0.0)
        page2.insert_text((480, yp), answer, fontsize=9, fontname="helv", color=ans_color)
        yp += 14
        if detail:
            page2.insert_text((75, yp), detail, fontsize=8, fontname="helv", color=(0.4, 0.4, 0.4))
            yp += 14
        return yp + 4

    questions = [
        ("Etes-vous actuellement en arret de travail ou en invalidite ?", "NON", ""),
        ("Suivez-vous actuellement un traitement medical ?", "OUI", "Amlodipine 5mg/jour pour hypertension arterielle depuis janvier 2022."),
        ("Avez-vous ete hospitalise au cours des 10 dernieres annees ?", "NON", "Appendicectomie en 2005 (> 10 ans)."),
        ("Avez-vous ete opere au cours des 5 dernieres annees ?", "NON", ""),
        ("Souffrez-vous de maladie cardiaque ou vasculaire ?", "OUI", "Hypertension arterielle essentielle diagnostiquee en 2021, controlee sous Amlodipine. TA derniere mesure : 135/82 mmHg."),
        ("Souffrez-vous de diabete ?", "NON", "Glycemie a jeun : 1.05 g/L (normale). Pere diabetique type 2."),
        ("Avez-vous des troubles de la vue necessitant correction ?", "OUI", "Presbytie + myopie legere. Port de lunettes progressives depuis 2023."),
        ("Avez-vous des soins dentaires prevus ou en cours ?", "OUI", "Couronne ceramique prevue sur premolaire superieure droite (devis joint si demande)."),
        ("Fumez-vous ou avez-vous fume ?", "OUI", "Ancien fumeur. Arret definitif en mars 2021. Environ 15 paquets-annee."),
        ("Consommez-vous de l'alcool regulierement ?", "NON", "Consommation occasionnelle et moderee dans le cadre professionnel (chef cuisinier)."),
        ("Pratiquez-vous un sport a risque ?", "NON", "Jogging 2x/semaine, natation 1x/semaine."),
        ("Avez-vous des allergies connues ?", "OUI", "Allergie aux acariens (rhinite allergique saisonniere, traitement Cetirizine au besoin)."),
        ("Avez-vous des antecedents familiaux significatifs ?", "OUI", "Pere : diabete type 2 (diagnostique a 55 ans, sous metformine). Mere : en bonne sante."),
        ("Avez-vous subi un bilan de sante complet recemment ?", "OUI", "Bilan complet mars 2026 : voir resultats analyses joints."),
    ]

    for i, (q, a, d) in enumerate(questions, 1):
        y2 = question(i, q, a, d, y2)
        if y2 > 720:
            break

    # Signature
    y2 += 10
    page2.draw_line((40, y2), (555, y2), color=(0.85, 0.85, 0.85), width=0.5)
    y2 += 16
    page2.insert_text((50, y2), "Je certifie sur l'honneur que les reponses ci-dessus sont exactes et completes.", fontsize=8, fontname="helv", color=(0.15, 0.15, 0.15))
    y2 += 14
    page2.insert_text((50, y2), "Fait a Bordeaux, le 25 mars 2026", fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))
    y2 += 14
    page2.insert_text((50, y2), "Signature : A. Lefevre", fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))

    # Liste des pieces jointes
    y2 += 30
    page2.draw_rect(fitz.Rect(40, y2 - 5, 555, y2 + 85), color=(0.95, 0.99, 0.97), fill=(0.95, 0.99, 0.97))
    page2.insert_text((50, y2 + 8), "PIECES JOINTES A FOURNIR :", fontsize=9, fontname="helv", color=(0, 0.41, 0.32))

    pieces = [
        "1. Copie de la carte nationale d'identite (recto/verso)",
        "2. Attestation de droits Securite Sociale (CPAM Gironde)",
        "3. RIB bancaire pour prelevement mensuel",
        "4. Ordonnance medicale en cours (Amlodipine 5mg)",
        "5. Resultats d'analyses sanguines (bilan mars 2026)",
    ]
    yp = y2 + 22
    for p in pieces:
        page2.insert_text((60, yp), p, fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))
        yp += 12

    # Footer
    page2.insert_text((40, 800), "Groupama Centre-Atlantique — Service Souscription Sante", fontsize=7, fontname="helv", color=(0.5, 0.5, 0.5))
    page2.insert_text((40, 812), "Document confidentiel — Usage strictement limite a l'analyse de la demande de souscription.", fontsize=7, fontname="helv", color=(0.5, 0.5, 0.5))
    page2.insert_text((440, 812), "Page 2/2", fontsize=7, fontname="helv", color=(0.5, 0.5, 0.5))

    doc.save(str(output_path))
    doc.close()

    print(f"PDF genere : {output_path}")
    print(f"   2 pages, logo Groupama, questionnaire de sante complet")
    print(f"   Client : Antoine LEFEVRE, 48 ans, chef cuisinier, Bordeaux")
    print(f"   Email  : antoine.lefevre@cuisine-bordeaux.fr")
    print(f"   Pathologies : HTA controlee, ancien fumeur, allergie acariens")
    print(f"   ATCD familiaux : pere diabetique type 2")
    print(f"   Formule : Equilibre Plus (~127 EUR/mois)")


if __name__ == "__main__":
    generate_underwriting_pdf()
