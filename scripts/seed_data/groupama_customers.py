"""Seed data — 30 French Groupama customers for Customer 360 demo."""

from __future__ import annotations

from app.customer360 import (
    CustomerJourneyEvent,
    CustomerProfile,
    RiskCorrelation,
    save_customer_journey,
    save_customer_profile,
    save_customer_risk_correlations,
)


# fmt: off
CUSTOMERS: list[dict] = [
    {"id": "GRP-001", "name": "MERTENS LAFFITE Olivier",   "dob": "1982-07-14", "email": "mlo@wine.com",              "phone": "06 12 34 56 78", "addr": "42 rue des Vignobles, 33000 Bordeaux",       "since": "2021-06-15", "risk": "medium", "tags": ["sinistre-récent", "habitation", "cave-à-vins"]},
    {"id": "GRP-002", "name": "DUPONT Marie",              "dob": "1975-03-22", "email": "m.dupont@free.fr",          "phone": "06 23 45 67 89", "addr": "8 avenue de la République, 75011 Paris",     "since": "2015-01-10", "risk": "low",    "tags": ["fidèle", "multi-contrats", "auto+habitation"]},
    {"id": "GRP-003", "name": "BERNARD Thomas",            "dob": "1990-11-05", "email": "t.bernard@gmail.com",       "phone": "06 34 56 78 90", "addr": "15 rue du Château, 69002 Lyon",             "since": "2020-03-20", "risk": "low",    "tags": ["jeune-conducteur", "auto"]},
    {"id": "GRP-004", "name": "PETIT Sophie",              "dob": "1968-08-30", "email": "s.petit@orange.fr",         "phone": "06 45 67 89 01", "addr": "23 chemin des Oliviers, 13100 Aix-en-Prov.","since": "2008-09-01", "risk": "low",    "tags": ["fidèle", "santé", "retraitée"]},
    {"id": "GRP-005", "name": "LEROY Jean-Marc",           "dob": "1985-04-18", "email": "jm.leroy@hotmail.fr",       "phone": "06 56 78 90 12", "addr": "7 place du Marché, 44000 Nantes",           "since": "2019-11-01", "risk": "medium", "tags": ["habitation", "dégâts-des-eaux"]},
    {"id": "GRP-006", "name": "MOREAU Isabelle",           "dob": "1972-12-03", "email": "i.moreau@wanadoo.fr",       "phone": "06 67 89 01 23", "addr": "55 boulevard Haussmann, 75008 Paris",       "since": "2012-04-15", "risk": "low",    "tags": ["multi-contrats", "santé", "vie"]},
    {"id": "GRP-007", "name": "GARCIA Antonio",            "dob": "1988-06-21", "email": "a.garcia@gmail.com",        "phone": "06 78 90 12 34", "addr": "12 rue de la Gare, 31000 Toulouse",         "since": "2022-01-15", "risk": "high",   "tags": ["sinistre-auto", "récidive"]},
    {"id": "GRP-008", "name": "MARTIN Claire",             "dob": "1995-02-14", "email": "c.martin@yahoo.fr",         "phone": "06 89 01 23 45", "addr": "3 impasse des Lilas, 35000 Rennes",         "since": "2023-06-01", "risk": "low",    "tags": ["nouveau-client", "habitation"]},
    {"id": "GRP-009", "name": "DUBOIS Philippe",           "dob": "1960-09-28", "email": "p.dubois@sfr.fr",           "phone": "06 90 12 34 56", "addr": "18 rue Pasteur, 67000 Strasbourg",          "since": "2005-02-01", "risk": "medium", "tags": ["fidèle", "santé", "chronique"]},
    {"id": "GRP-010", "name": "LEFEBVRE Nathalie",         "dob": "1979-01-07", "email": "n.lefebvre@laposte.net",    "phone": "07 01 23 45 67", "addr": "29 avenue Jean Jaurès, 59000 Lille",        "since": "2017-08-20", "risk": "low",    "tags": ["auto", "habitation"]},
    {"id": "GRP-011", "name": "ROUX Frédéric",             "dob": "1983-05-11", "email": "f.roux@outlook.fr",         "phone": "07 12 34 56 78", "addr": "6 rue Victor Hugo, 33000 Bordeaux",         "since": "2018-03-10", "risk": "low",    "tags": ["habitation", "auto"]},
    {"id": "GRP-012", "name": "FOURNIER Camille",          "dob": "1992-10-25", "email": "c.fournier@gmail.com",      "phone": "07 23 45 67 89", "addr": "41 rue de la Paix, 75002 Paris",            "since": "2021-09-15", "risk": "low",    "tags": ["santé", "auto"]},
    {"id": "GRP-013", "name": "GIRARD Laurent",            "dob": "1970-07-04", "email": "l.girard@free.fr",          "phone": "07 34 56 78 90", "addr": "22 chemin de Ronde, 78000 Versailles",      "since": "2010-06-01", "risk": "medium", "tags": ["habitation", "tempête", "sinistre-2024"]},
    {"id": "GRP-014", "name": "BONNET Véronique",          "dob": "1966-04-19", "email": "v.bonnet@orange.fr",        "phone": "07 45 67 89 01", "addr": "9 place de l'Église, 21000 Dijon",          "since": "2009-11-15", "risk": "low",    "tags": ["fidèle", "vie", "épargne"]},
    {"id": "GRP-015", "name": "LAMBERT Sébastien",         "dob": "1987-08-08", "email": "s.lambert@hotmail.fr",      "phone": "07 56 78 90 12", "addr": "17 rue des Remparts, 34000 Montpellier",    "since": "2020-07-01", "risk": "high",   "tags": ["sinistre-habitation", "fraude-suspectée"]},
    {"id": "GRP-016", "name": "FONTAINE Aurélie",          "dob": "1993-12-31", "email": "a.fontaine@gmail.com",      "phone": "07 67 89 01 23", "addr": "5 allée des Cerisiers, 69003 Lyon",         "since": "2022-04-10", "risk": "low",    "tags": ["santé", "jeune"]},
    {"id": "GRP-017", "name": "ROUSSEAU Marc",             "dob": "1958-03-15", "email": "m.rousseau@wanadoo.fr",     "phone": "07 78 90 12 34", "addr": "33 rue Nationale, 37000 Tours",              "since": "2003-01-20", "risk": "medium", "tags": ["fidèle", "santé", "hospitalisation"]},
    {"id": "GRP-018", "name": "VINCENT Émilie",            "dob": "1991-06-27", "email": "e.vincent@yahoo.fr",        "phone": "07 89 01 23 45", "addr": "14 boulevard de la Liberté, 06000 Nice",    "since": "2019-05-01", "risk": "low",    "tags": ["auto", "habitation", "côte-d'azur"]},
    {"id": "GRP-019", "name": "MULLER Hans",               "dob": "1976-11-12", "email": "h.muller@gmail.com",        "phone": "07 90 12 34 56", "addr": "2 rue de l'Ill, 67000 Strasbourg",          "since": "2014-08-15", "risk": "low",    "tags": ["frontalier", "multi-contrats"]},
    {"id": "GRP-020", "name": "LECOMTE Sandrine",          "dob": "1984-09-03", "email": "s.lecomte@laposte.net",     "phone": "06 01 23 45 67", "addr": "28 rue du Faubourg, 51100 Reims",           "since": "2016-12-01", "risk": "medium", "tags": ["habitation", "cave", "inondation"]},
    {"id": "GRP-021", "name": "HENRY Patrick",             "dob": "1962-02-20", "email": "p.henry@sfr.fr",           "phone": "06 11 22 33 44", "addr": "10 place Bellecour, 69002 Lyon",            "since": "2007-03-10", "risk": "low",    "tags": ["fidèle", "vie", "succession"]},
    {"id": "GRP-022", "name": "CHEVALIER Julie",           "dob": "1997-05-09", "email": "j.chevalier@outlook.fr",    "phone": "06 22 33 44 55", "addr": "19 rue des Étudiants, 38000 Grenoble",      "since": "2024-01-15", "risk": "low",    "tags": ["nouveau-client", "auto", "étudiant"]},
    {"id": "GRP-023", "name": "RENARD Christophe",         "dob": "1973-08-17", "email": "c.renard@free.fr",          "phone": "06 33 44 55 66", "addr": "7 route de la Corniche, 13007 Marseille",   "since": "2011-05-20", "risk": "medium", "tags": ["flotte-auto", "professionnel"]},
    {"id": "GRP-024", "name": "LEMAIRE Sylvie",            "dob": "1969-01-28", "email": "s.lemaire@orange.fr",       "phone": "06 44 55 66 77", "addr": "36 cours Mirabeau, 13100 Aix-en-Provence",  "since": "2013-09-01", "risk": "low",    "tags": ["habitation", "santé", "fidèle"]},
    {"id": "GRP-025", "name": "ARNAUD Thierry",            "dob": "1980-04-02", "email": "t.arnaud@hotmail.fr",       "phone": "06 55 66 77 88", "addr": "11 rue de Metz, 54000 Nancy",               "since": "2018-11-15", "risk": "high",   "tags": ["sinistre-multiple", "auto", "habitation"]},
    {"id": "GRP-026", "name": "PICARD Delphine",           "dob": "1994-07-23", "email": "d.picard@gmail.com",        "phone": "06 66 77 88 99", "addr": "4 quai de la Pêcherie, 69001 Lyon",         "since": "2023-02-01", "risk": "low",    "tags": ["santé", "optique", "dentaire"]},
    {"id": "GRP-027", "name": "ROGER Dominique",           "dob": "1955-11-30", "email": "d.roger@wanadoo.fr",        "phone": "06 77 88 99 00", "addr": "25 avenue de Grammont, 37000 Tours",        "since": "2001-07-01", "risk": "low",    "tags": ["fidèle-25ans", "multi-contrats", "retraité"]},
    {"id": "GRP-028", "name": "SCHMITT Éric",              "dob": "1978-10-14", "email": "e.schmitt@sfr.fr",          "phone": "06 88 99 00 11", "addr": "8 rue de la Krutenau, 67000 Strasbourg",    "since": "2015-04-10", "risk": "medium", "tags": ["habitation", "grêle", "toiture"]},
    {"id": "GRP-029", "name": "BLANCHARD Stéphanie",       "dob": "1986-03-06", "email": "s.blanchard@yahoo.fr",      "phone": "06 99 00 11 22", "addr": "16 rue Jeanne d'Arc, 45000 Orléans",        "since": "2019-08-20", "risk": "low",    "tags": ["auto", "habitation", "famille"]},
    {"id": "GRP-030", "name": "DA SILVA Carlos",           "dob": "1981-12-09", "email": "c.dasilva@gmail.com",       "phone": "07 00 11 22 33", "addr": "20 rue de la Devise, 33000 Bordeaux",       "since": "2020-10-01", "risk": "medium", "tags": ["habitation", "dégâts-des-eaux", "locataire"]},
]
# fmt: on

JOURNEY_TEMPLATES: dict[str, list[dict]] = {
    "habitation": [
        {"persona": "underwriting", "event_type": "souscription_habitation", "title": "Souscription MRH", "summary": "Contrat Multirisque Habitation souscrit.", "status": "actif", "risk_level": "low"},
    ],
    "auto": [
        {"persona": "automotive_claims", "event_type": "souscription_auto", "title": "Souscription Auto", "summary": "Contrat auto tous risques souscrit.", "status": "actif", "risk_level": "low"},
    ],
    "santé": [
        {"persona": "life_health_claims", "event_type": "souscription_sante", "title": "Souscription Complémentaire Santé", "summary": "Contrat complémentaire santé Groupama souscrit.", "status": "actif", "risk_level": "low"},
    ],
    "sinistre-habitation": [
        {"persona": "habitation_claims", "event_type": "sinistre_declare", "title": "Déclaration sinistre habitation", "summary": "Sinistre habitation déclaré suite à intempéries.", "status": "en_cours", "risk_level": "medium"},
    ],
    "sinistre-auto": [
        {"persona": "automotive_claims", "event_type": "sinistre_declare", "title": "Déclaration sinistre auto", "summary": "Sinistre automobile déclaré.", "status": "en_cours", "risk_level": "medium"},
    ],
}


def create_groupama_customers(storage_root: str) -> int:
    """Create 30 Groupama customer profiles with journey events."""
    count = 0
    for c in CUSTOMERS:
        profile = CustomerProfile(
            id=c["id"],
            name=c["name"],
            date_of_birth=c["dob"],
            email=c["email"],
            phone=c["phone"],
            address=c["addr"],
            customer_since=c["since"],
            risk_tier=c["risk"],
            tags=c["tags"],
            notes="",
        )
        save_customer_profile(storage_root, profile)

        # Generate journey events based on tags
        events: list[CustomerJourneyEvent] = []
        app_idx = 0
        for tag in c["tags"]:
            for key, templates in JOURNEY_TEMPLATES.items():
                if key in tag:
                    for tmpl in templates:
                        app_idx += 1
                        events.append(CustomerJourneyEvent(
                            date=c["since"],
                            persona=tmpl["persona"],
                            application_id=f"app-{c['id'].lower()}-{app_idx:03d}",
                            event_type=tmpl["event_type"],
                            title=tmpl["title"],
                            summary=tmpl["summary"],
                            status=tmpl["status"],
                            risk_level=tmpl.get("risk_level"),
                        ))

        if events:
            save_customer_journey(storage_root, c["id"], events)

        # Risk correlations for high-risk customers
        if c["risk"] == "high":
            correlations = [
                RiskCorrelation(
                    correlation_id=f"RC-{c['id']}-001",
                    risk_type="multi_sinistralité",
                    severity="high",
                    description=f"Client {c['name']} présente un historique de sinistres multiples.",
                    contributing_personas=[t["persona"] for t in templates for key, templates in JOURNEY_TEMPLATES.items() if key in " ".join(c["tags"])],
                    recommended_action="Revue de portefeuille recommandée",
                ),
            ]
            save_customer_risk_correlations(storage_root, c["id"], correlations)

        count += 1
    return count
