"""Seed data for 3 claims applications (1 health + 2 automotive).

Provides rich, realistic data matching French Groupama insurance scenarios.
Uses GRP-xxx customer references from groupama_customers.py.
"""

from typing import Any, Dict, List


def _garcia_antonio_auto() -> Dict[str, Any]:
    """GRP-007 GARCIA Antonio — collision arrière mineure à Toulouse, tiers responsable."""
    return {
        "id": "app-sc-auto-001",
        "created_at": "2024-11-18T14:32:00Z",
        "external_reference": "GRP-007",
        "status": "completed",
        "persona": "automotive_claims",
        "files": [
            {"filename": "constat_amiable.pdf", "path": "applications/app-sc-auto-001/constat_amiable.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "rapport_police.pdf", "path": "applications/app-sc-auto-001/rapport_police.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "photo_pare_chocs_arriere.jpg", "path": "applications/app-sc-auto-001/photo_pare_chocs_arriere.jpg", "content_type": "image/jpeg", "media_type": "image"},
            {"filename": "photo_coffre.jpg", "path": "applications/app-sc-auto-001/photo_coffre.jpg", "content_type": "image/jpeg", "media_type": "image"},
            {"filename": "devis_reparation.pdf", "path": "applications/app-sc-auto-001/devis_reparation.pdf", "content_type": "application/pdf", "media_type": "document"},
        ],
        "llm_outputs": {
            "damage_assessment": {
                "visual_damage_analysis": {
                    "section": "damage_assessment",
                    "subsection": "visual_damage_analysis",
                    "raw": (
                        "Véhicule assuré : Renault Clio V (2021), photographié au garage AD "
                        "Toulouse Sud. Impact localisé à l'arrière du véhicule. Le pare-chocs arrière "
                        "présente une déformation modérée avec fissuration le long du bord inférieur "
                        "et un transfert de peinture du véhicule percuteur. Le coffre montre un léger "
                        "flambage sur le bord arrière avec écaillage mineur de peinture. Aucune intrusion "
                        "structurelle dans l'habitacle. Feux arrière intacts. Système d'échappement intact."
                    ),
                    "parsed": {
                        "summary": "Dommages modérés par impact arrière, limités au pare-chocs et au coffre. Cohérent avec une collision à basse vitesse.",
                        "overall_severity": "moderate",
                        "damage_areas": [
                            {"location": "Pare-chocs arrière", "severity": "moderate", "description": "Déformation et fissuration le long du bord inférieur avec transfert de peinture", "estimated_cost": 850.00, "confidence": 0.92},
                            {"location": "Coffre", "severity": "minor", "description": "Léger flambage sur le bord arrière avec écaillage de peinture ; mécanisme de verrouillage fonctionnel", "estimated_cost": 620.00, "confidence": 0.89},
                            {"location": "Traverse arrière", "severity": "minor", "description": "Légère flexion détectée ; remplacement recommandé", "estimated_cost": 430.00, "confidence": 0.85},
                        ],
                        "total_damage_estimate": 1900.00,
                        "airbag_deployment": False,
                        "vehicle_drivable": True,
                        "recommended_action": "Approuver la réparation",
                    },
                },
                "estimate_validation": {
                    "section": "damage_assessment",
                    "subsection": "estimate_validation",
                    "raw": (
                        "Devis du garage AD Toulouse Sud vérifié par rapport aux barèmes Groupama. "
                        "Le tarif des pièces pour Renault Clio V — pare-chocs arrière, traverse et "
                        "coffre — est conforme aux prix catalogue constructeur. La main-d'œuvre de "
                        "6,5 heures correspond aux standards du métier pour démontage/remontage du "
                        "pare-chocs, remise en état et remplacement du coffre. L'allocation peinture "
                        "et matériaux est raisonnable. Aucune substitution de pièces adaptables notée."
                    ),
                    "parsed": {
                        "summary": "Devis conforme aux barèmes pour les réparations décrites sur une Renault Clio V 2021.",
                        "estimate_id": "DEV-AG-2024-0472",
                        "parts_breakdown": 1050.00,
                        "labor_hours": 6.5,
                        "labor_rate_per_hour": 72.00,
                        "labor_cost": 468.00,
                        "sublet_items": [],
                        "paint_materials": 382.00,
                        "estimate_accuracy": "Conforme",
                        "comparison_market": "Dans la fourchette du marché",
                        "recommended_action": "Approuver",
                    },
                },
            },
            "liability_assessment": {
                "fault_determination": {
                    "section": "liability_assessment",
                    "subsection": "fault_determination",
                    "raw": (
                        "Le constat amiable n° CA-2024-TLS-88214 confirme que le véhicule assuré "
                        "était à l'arrêt au feu rouge à l'intersection de l'avenue Jean Jaurès et "
                        "de la rue de Metz à Toulouse lorsqu'il a été percuté par l'arrière par un "
                        "Peugeot 308 (2019). Deux témoins indépendants corroborent que le conducteur "
                        "tiers n'a pas freiné à temps. Le tiers est déclaré entièrement responsable."
                    ),
                    "parsed": {
                        "summary": "Responsabilité claire : assuré 0 % ; tiers 100 % responsable, confirmé par constat amiable et témoignages.",
                        "fault_determination": "0 % — tiers 100 % responsable",
                        "fault_percentage": 0,
                        "contributing_factors": ["Tiers suivant de trop près", "Tiers n'a pas respecté la distance de sécurité"],
                        "liability_risk": "Responsabilité claire",
                        "rationale": "L'assuré était immobilisé au feu rouge. Le tiers l'a percuté par l'arrière.",
                    },
                },
            },
            "fraud_detection": {
                "red_flag_analysis": {
                    "section": "fraud_detection",
                    "subsection": "red_flag_analysis",
                    "raw": (
                        "Aucun indicateur de fraude détecté pour ce sinistre. Le schéma de dommages "
                        "est entièrement cohérent avec la collision arrière décrite. La déclaration "
                        "a été rapide (le jour même). Le constat amiable est conforme et corrobore "
                        "le récit de l'assuré. Aucun antécédent préoccupant. Le devis est dans "
                        "les normes du marché. Aucun lien entre les parties identifié."
                    ),
                    "parsed": {
                        "summary": "Aucun indicateur de fraude. Circonstances, dommages et documentation cohérents et crédibles.",
                        "red_flags": [],
                        "fraud_risk": "Faible",
                        "fraud_score": 0.08,
                        "recommended_action": "Poursuivre le traitement du sinistre",
                    },
                },
            },
            "payout_recommendation": {
                "settlement_analysis": {
                    "section": "payout_recommendation",
                    "subsection": "settlement_analysis",
                    "raw": (
                        "Indemnisation recommandée de 1 900 € pour réparation du pare-chocs arrière, "
                        "de la traverse et du coffre. L'assuré bénéficie d'une franchise de 300 € ; "
                        "cependant, comme il est 0 % responsable, un recours sera engagé contre "
                        "l'assureur du tiers (MAIF, police n° MAIF-2019-337841) pour récupérer "
                        "l'intégralité de l'indemnisation plus la franchise. Aucun dommage corporel."
                    ),
                    "parsed": {
                        "summary": "Approuver l'indemnisation de 1 900 €. Recours contre l'assureur du tiers.",
                        "recommended_amount": 1900.00,
                        "deductible": 300.00,
                        "insured_responsibility": 0.00,
                        "subrogation_target": "MAIF — police MAIF-2019-337841",
                        "final_approval": True,
                        "rationale": "Assuré non responsable. Dommages vérifiés, devis conforme. Recours engagé pour récupération intégrale.",
                        "policy_citations": [
                            {"policy_id": "AC-GRP-001", "title": "Conditions Générales Auto Groupama — Art. 8.2", "section": "Garantie Dommages Collision", "text": "Prise en charge des dommages matériels en cas de collision avec un tiers identifié, sous déduction de la franchise contractuelle.", "relevance": 0.95},
                            {"policy_id": "AC-GRP-002", "title": "Conditions Générales Auto Groupama — Art. 12.1", "section": "Recours et Subrogation", "text": "Groupama exerce un recours contre le tiers responsable ou son assureur pour le montant des indemnités versées.", "relevance": 0.92},
                        ],
                    },
                },
            },
        },
        "extracted_fields": {
            "constat:NumeroSinistre": {"field_name": "NumeroSinistre", "value": "SIN-AG-241118-01", "confidence": 0.95, "source_file": "constat_amiable.pdf"},
            "constat:NumeroPolice": {"field_name": "NumeroPolice", "value": "AUTO-GRP-7724519", "confidence": 0.97, "source_file": "constat_amiable.pdf"},
            "constat:NomAssure": {"field_name": "NomAssure", "value": "GARCIA Antonio", "confidence": 0.98, "source_file": "constat_amiable.pdf"},
            "constat:DateSinistre": {"field_name": "DateSinistre", "value": "15/11/2024", "confidence": 0.96, "source_file": "constat_amiable.pdf"},
            "constat:AnneeVehicule": {"field_name": "AnneeVehicule", "value": "2021", "confidence": 0.97, "source_file": "constat_amiable.pdf"},
            "constat:MarqueVehicule": {"field_name": "MarqueVehicule", "value": "Renault", "confidence": 0.96, "source_file": "constat_amiable.pdf"},
            "constat:ModeleVehicule": {"field_name": "ModeleVehicule", "value": "Clio V", "confidence": 0.96, "source_file": "constat_amiable.pdf"},
            "constat:Immatriculation": {"field_name": "Immatriculation", "value": "FG-472-MK", "confidence": 0.93, "source_file": "constat_amiable.pdf"},
            "constat:DescriptionDommages": {"field_name": "DescriptionDommages", "value": "Dommages pare-chocs arrière et coffre suite à collision arrière", "confidence": 0.92, "source_file": "constat_amiable.pdf"},
            "devis:MontantReparation": {"field_name": "MontantReparation", "value": "1900.00", "confidence": 0.95, "source_file": "devis_reparation.pdf"},
            "rapport:NumeroRapport": {"field_name": "NumeroRapport", "value": "PV-2024-TLS-88214", "confidence": 0.94, "source_file": "rapport_police.pdf"},
            "rapport:AssureurTiers": {"field_name": "AssureurTiers", "value": "MAIF", "confidence": 0.91, "source_file": "rapport_police.pdf"},
        },
        "confidence_summary": {
            "total_fields": 12,
            "average_confidence": 0.95,
            "high_confidence_count": 11,
            "medium_confidence_count": 1,
            "low_confidence_count": 0,
            "high_confidence_fields": [
                {"name": "constat:NomAssure", "confidence": 0.98},
                {"name": "constat:NumeroPolice", "confidence": 0.97},
                {"name": "constat:AnneeVehicule", "confidence": 0.97},
                {"name": "constat:MarqueVehicule", "confidence": 0.96},
                {"name": "constat:ModeleVehicule", "confidence": 0.96},
                {"name": "constat:DateSinistre", "confidence": 0.96},
                {"name": "constat:NumeroSinistre", "confidence": 0.95},
                {"name": "devis:MontantReparation", "confidence": 0.95},
                {"name": "rapport:NumeroRapport", "confidence": 0.94},
                {"name": "constat:Immatriculation", "confidence": 0.93},
                {"name": "constat:DescriptionDommages", "confidence": 0.92},
            ],
            "medium_confidence_fields": [
                {"name": "rapport:AssureurTiers", "confidence": 0.91},
            ],
            "low_confidence_fields": [],
        },
    }


def _rousseau_marc_health() -> Dict[str, Any]:
    """GRP-017 ROUSSEAU Marc — hospitalisation genou, actes chirurgicaux remboursés."""
    return {
        "id": "app-mw-hc-001",
        "created_at": "2024-07-10T09:15:00Z",
        "external_reference": "GRP-017",
        "status": "completed",
        "persona": "life_health_claims",
        "files": [
            {"filename": "declaration_sinistre_sante.pdf", "path": "applications/app-mw-hc-001/declaration_sinistre_sante.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "decompte_securite_sociale.pdf", "path": "applications/app-mw-hc-001/decompte_securite_sociale.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "compte_rendu_chirurgical.pdf", "path": "applications/app-mw-hc-001/compte_rendu_chirurgical.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "facture_hospitalisation.pdf", "path": "applications/app-mw-hc-001/facture_hospitalisation.pdf", "content_type": "application/pdf", "media_type": "document"},
        ],
        "llm_outputs": {
            "clinical_case_notes": {
                "reason_for_visit": {
                    "section": "clinical_case_notes",
                    "subsection": "reason_for_visit",
                    "raw": (
                        "ROUSSEAU Marc, 66 ans, adressé au Dr Laurent MICHAUD (chirurgie orthopédique, "
                        "CHU de Tours) le 15/05/2024 pour gonarthrose invalidante du genou droit. "
                        "Douleurs progressives depuis 2 ans, limitation fonctionnelle croissante à la "
                        "marche (< 500 m), escaliers impossibles. Traitements conservateurs épuisés : "
                        "infiltrations corticoïdes (x3), kinésithérapie (30 séances), antalgiques "
                        "palier II. IRM confirmant arthrose fémoro-tibiale médiale stade IV Kellgren-Lawrence. "
                        "Indication chirurgicale retenue : prothèse totale de genou droit."
                    ),
                    "parsed": {
                        "summary": "Patient adressé pour chirurgie prothétique du genou droit suite à gonarthrose invalidante.",
                        "chief_complaint": "Gonarthrose invalidante du genou droit avec limitation fonctionnelle majeure",
                        "symptom_duration": "Progressive sur 2 ans",
                        "severity": "Sévère",
                        "urgency": "Programmée",
                        "history_of_present_illness": (
                            "Homme de 66 ans avec gonarthrose stade IV Kellgren-Lawrence du genou droit. "
                            "Traitements conservateurs épuisés (infiltrations x3, kiné 30 séances, antalgiques "
                            "palier II). Limitation de marche < 500 m, escaliers impossibles. "
                            "Indication de prothèse totale de genou retenue en RCP."
                        ),
                    },
                },
                "key_diagnoses": {
                    "section": "clinical_case_notes",
                    "subsection": "key_diagnoses",
                    "raw": (
                        "Diagnostic principal : gonarthrose primitive du genou droit, stade IV "
                        "Kellgren-Lawrence avec pincement complet de l'interligne fémoro-tibiale médiale. "
                        "Comorbidités : hypertension artérielle traitée (amlodipine 5 mg), diabète de type 2 "
                        "équilibré (metformine 1000 mg x2/j, HbA1c 6,8 %). Codes CIM-10 : M17.1 (gonarthrose "
                        "primitive), I10 (HTA), E11.9 (diabète type 2)."
                    ),
                    "parsed": {
                        "summary": "Gonarthrose primitive sévère du genou droit. Comorbidités contrôlées (HTA, diabète type 2).",
                        "primary_diagnosis": "M17.1 — Gonarthrose primitive du genou droit",
                        "secondary_diagnoses": ["I10 — Hypertension artérielle essentielle", "E11.9 — Diabète de type 2"],
                        "diagnosis_consistency": "Oui",
                        "coding_accuracy": "Conforme",
                    },
                },
                "medical_necessity": {
                    "section": "clinical_case_notes",
                    "subsection": "medical_necessity",
                    "raw": (
                        "Tous les actes réalisés sont médicalement justifiés compte tenu du tableau "
                        "clinique. L'arthrose stade IV avec épuisement des traitements conservateurs "
                        "constitue une indication chirurgicale validée par la HAS. La consultation "
                        "pré-anesthésique était requise (ASA II). L'hospitalisation de 5 jours est "
                        "conforme aux durées moyennes de séjour (DMS) pour PTG. La rééducation "
                        "post-opératoire de 20 séances est dans les recommandations HAS."
                    ),
                    "parsed": {
                        "summary": "Tous les actes médicalement nécessaires conformément aux recommandations HAS.",
                        "necessity_determination": "Nécessaire",
                        "clinical_rationale": (
                            "Gonarthrose stade IV avec échec des traitements conservateurs. "
                            "Indication chirurgicale validée par la HAS. Hospitalisation conforme "
                            "à la DMS nationale. Rééducation dans les recommandations."
                        ),
                        "services_reviewed": [
                            {"service": "Consultation orthopédique", "code": "CCAM NZQK001", "necessity_status": "Nécessaire", "rationale": "Bilan pré-opératoire et pose d'indication chirurgicale"},
                            {"service": "Consultation pré-anesthésique", "code": "CCAM ZZQM006", "necessity_status": "Nécessaire", "rationale": "Patient ASA II (HTA + diabète), anesthésie générale prévue"},
                            {"service": "Prothèse totale de genou", "code": "CCAM NFKA007", "necessity_status": "Nécessaire", "rationale": "Gonarthrose stade IV, traitements conservateurs épuisés"},
                            {"service": "Hospitalisation 5 jours", "code": "GHS 3682", "necessity_status": "Nécessaire", "rationale": "Conforme à la DMS nationale pour PTG"},
                            {"service": "Rééducation (20 séances)", "code": "CCAM NZRB001", "necessity_status": "Nécessaire", "rationale": "Protocole post-PTG recommandé par la HAS"},
                        ],
                        "documentation_quality": "Complète",
                        "recommended_action": "Approuver tous les actes",
                    },
                },
            },
            "clinical_timeline": {
                "treatment_timeline": {
                    "section": "clinical_timeline",
                    "subsection": "treatment_timeline",
                    "raw": (
                        "Parcours de soins sur 60 jours. 15/05/2024 : consultation orthopédique "
                        "initiale, IRM confirmant indication chirurgicale. 22/05/2024 : consultation "
                        "pré-anesthésique, bilan sanguin pré-opératoire. 03/06/2024 : admission CHU "
                        "Tours, pose PTG genou droit sous AG. 04-07/06/2024 : hospitalisation, "
                        "rééducation initiale. 08/06/2024 : sortie, transfert SSR. 10/06-15/07/2024 : "
                        "20 séances de rééducation en centre SSR Touraine."
                    ),
                    "parsed": {
                        "summary": "Parcours chirurgical complet sur 60 jours avec suites opératoires conformes.",
                        "timeline_events": [
                            {"date": "2024-05-15", "event": "Consultation orthopédique initiale", "event_type": "visit", "description": "Bilan clinique et IRM, indication PTG retenue", "duration_days": 0},
                            {"date": "2024-05-22", "event": "Consultation pré-anesthésique", "event_type": "visit", "description": "Bilan pré-opératoire, patient ASA II", "duration_days": 7},
                            {"date": "2024-06-03", "event": "Chirurgie PTG genou droit", "event_type": "procedure", "description": "Pose de prothèse totale de genou sous anesthésie générale", "duration_days": 19},
                            {"date": "2024-06-08", "event": "Sortie d'hospitalisation", "event_type": "visit", "description": "Sortie J+5, transfert en SSR", "duration_days": 24},
                            {"date": "2024-07-15", "event": "Fin de rééducation", "event_type": "visit", "description": "20 séances de kinésithérapie, récupération fonctionnelle satisfaisante", "duration_days": 61},
                        ],
                        "total_duration": 61,
                        "treatment_pattern": "Chirurgie programmée + rééducation",
                    },
                },
            },
            "benefits_policy": {
                "eligibility_verification": {
                    "section": "benefits_policy",
                    "subsection": "eligibility_verification",
                    "raw": (
                        "Adhérent ROUSSEAU Marc (n° adhérent GRP-SANTE-17892) vérifié comme actif "
                        "au titre du contrat collectif Complémentaire Santé Groupama Vitalia (n° groupe "
                        "GRP-COL-6621). Contrat en vigueur depuis le 20/01/2003, sans date de résiliation. "
                        "Tous les soins dispensés par des praticiens conventionnés secteur 1. Aucune "
                        "coordination inter-mutuelles requise. Cotisations à jour."
                    ),
                    "parsed": {
                        "summary": "Adhérent éligible pour l'ensemble des prestations demandées.",
                        "eligibility_status": "Éligible",
                        "member_info": {"name": "ROUSSEAU Marc", "member_id": "GRP-SANTE-17892", "group": "GRP-COL-6621"},
                        "coverage_dates": {"effective_date": "2003-01-20", "termination_date": "2025-12-31"},
                        "plan_details": {"plan_name": "Groupama Vitalia Confort+", "plan_type": "Complémentaire Santé", "network_status": "Conventionné Secteur 1"},
                        "eligibility_issues": [],
                        "processing_action": "Poursuivre",
                    },
                },
                "exclusions_limitations": {
                    "section": "benefits_policy",
                    "subsection": "exclusions_limitations",
                    "raw": (
                        "Aucune exclusion ou limitation applicable à ce sinistre. Les actes "
                        "chirurgicaux orthopédiques sont couverts au titre de la garantie hospitalisation. "
                        "La gonarthrose a été diagnostiquée bien après l'adhésion (2003). Pas de "
                        "délai de carence applicable. Pas de dépassements d'honoraires (secteur 1)."
                    ),
                    "parsed": {
                        "summary": "Aucune exclusion ni limitation applicable.",
                        "applicable_exclusions": [],
                        "pre_existing_review": "Non applicable — pathologie déclarée en cours de contrat",
                        "waiting_periods": "Aucun applicable",
                        "processing_action": "Approuver",
                    },
                },
                "benefit_limits": {
                    "section": "benefits_policy",
                    "subsection": "benefit_limits",
                    "raw": (
                        "L'adhérent a utilisé 2 hospitalisations sur un maximum annuel de 5. "
                        "Plafond annuel de remboursement de 50 000 € avec 3 240 € utilisés avant "
                        "ce sinistre. Franchise annuelle de 150 € déjà atteinte. Plafond optique/dentaire "
                        "non concerné. Tous les actes sont dans les limites de garantie."
                    ),
                    "parsed": {
                        "summary": "Tous les actes dans les limites de garantie.",
                        "applicable_limits": {"max_hospitalizations": 5, "max_amount": 50000},
                        "deductible_status": "Franchise annuelle atteinte",
                        "oop_maximum": 2500,
                        "limit_concerns": [],
                        "processing_action": "Approuver",
                    },
                },
            },
            "claim_line_evaluation": {
                "line_item_review": {
                    "section": "claim_line_evaluation",
                    "subsection": "line_item_review",
                    "raw": (
                        "Cinq lignes de prestations examinées. Tous les codes CCAM sont appropriés "
                        "pour les actes documentés. La consultation orthopédique (C2 + MPC) est "
                        "justifiée par la complexité du cas. La PTG (NFKA007) et l'hospitalisation "
                        "(GHS 3682) sont des actes distincts. Le bilan pré-anesthésique (ZZQM006) "
                        "est conforme. La rééducation (20 × NZRB001) est dans les recommandations HAS. "
                        "Montants réduits aux tarifs conventionnels Sécurité sociale, complément "
                        "pris en charge par la mutuelle à 100 % du TM."
                    ),
                    "parsed": {
                        "summary": "5 lignes de prestations examinées et approuvées.",
                        "total_billed": 8450.00,
                        "total_allowed": 7200.00,
                        "total_plan_pays": 2160.00,
                        "total_member_pays": 0.00,
                        "claim_lines": [
                            {"line_num": 1, "description": "Consultation orthopédique spécialisée", "code": "CCAM C2+MPC", "billed": "350,00 €", "allowed": "300,00 €", "plan_pays": "90,00 €", "member_pays": "0,00 €", "status": "Approuvé"},
                            {"line_num": 2, "description": "Consultation pré-anesthésique", "code": "CCAM ZZQM006", "billed": "120,00 €", "allowed": "100,00 €", "plan_pays": "30,00 €", "member_pays": "0,00 €", "status": "Approuvé"},
                            {"line_num": 3, "description": "Prothèse totale de genou", "code": "CCAM NFKA007", "billed": "4 800,00 €", "allowed": "4 200,00 €", "plan_pays": "1 260,00 €", "member_pays": "0,00 €", "status": "Approuvé"},
                            {"line_num": 4, "description": "Hospitalisation 5 jours (GHS)", "code": "GHS 3682", "billed": "2 380,00 €", "allowed": "2 000,00 €", "plan_pays": "600,00 €", "member_pays": "0,00 €", "status": "Approuvé"},
                            {"line_num": 5, "description": "Rééducation (20 séances kiné)", "code": "CCAM NZRB001", "billed": "800,00 €", "allowed": "600,00 €", "plan_pays": "180,00 €", "member_pays": "0,00 €", "status": "Approuvé"},
                        ],
                        "coding_issues": [],
                        "bundling_flags": [],
                        "recommended_action": "Approuver toutes les lignes",
                    },
                },
            },
            "tasks_decisions": {
                "final_decision": {
                    "section": "tasks_decisions",
                    "subsection": "final_decision",
                    "raw": (
                        "Sinistre SIN-MR-240710-01 approuvé en totalité. Les cinq lignes de "
                        "prestations sont médicalement justifiées, correctement codifiées et dans "
                        "les garanties du contrat. L'adhérent est éligible et les praticiens sont "
                        "conventionnés secteur 1. Aucune exclusion applicable. Part mutuelle de "
                        "2 160,00 € à verser au CHU de Tours. Reste à charge adhérent : 0,00 €. "
                        "Décompte à adresser à l'adhérent sous 5 jours ouvrés."
                    ),
                    "parsed": {
                        "summary": "Sinistre approuvé en totalité. Tous les actes médicalement justifiés et dans les garanties.",
                        "decision": "Approuvé",
                        "decision_rationale": (
                            "Tous les actes sont médicalement nécessaires pour un patient de 66 ans "
                            "présentant une gonarthrose stade IV avec échec des traitements conservateurs. "
                            "Codification conforme, pas de problème de cumul, praticiens conventionnés. "
                            "Adhérent éligible, franchise atteinte."
                        ),
                        "payment_summary": {"total_plan_pays": 2160.00, "total_member_pays": 0.00, "deductible_applied": 0},
                        "denial_reasons": [],
                        "pend_reasons": [],
                        "appeal_rights": "L'adhérent peut contester dans les 30 jours suivant le décompte",
                        "next_steps": ["Virement au CHU de Tours", "Envoi du décompte à l'adhérent"],
                        "reviewer_notes": "Documentation complète. Parcours de soins conforme aux recommandations HAS.",
                    },
                },
            },
        },
        "extracted_fields": {
            "declaration:NumeroSinistre": {"field_name": "NumeroSinistre", "value": "SIN-MR-240710-01", "confidence": 0.96, "source_file": "declaration_sinistre_sante.pdf"},
            "declaration:NomAdherent": {"field_name": "NomAdherent", "value": "ROUSSEAU Marc", "confidence": 0.98, "source_file": "declaration_sinistre_sante.pdf"},
            "declaration:NumeroAdherent": {"field_name": "NumeroAdherent", "value": "GRP-SANTE-17892", "confidence": 0.97, "source_file": "declaration_sinistre_sante.pdf"},
            "declaration:NumeroGroupe": {"field_name": "NumeroGroupe", "value": "GRP-COL-6621", "confidence": 0.96, "source_file": "declaration_sinistre_sante.pdf"},
            "declaration:NomContrat": {"field_name": "NomContrat", "value": "Groupama Vitalia Confort+", "confidence": 0.95, "source_file": "declaration_sinistre_sante.pdf"},
            "compte_rendu:CodeDiagnostic": {"field_name": "CodeDiagnostic", "value": "M17.1", "confidence": 0.97, "source_file": "compte_rendu_chirurgical.pdf"},
            "compte_rendu:DescriptionDiagnostic": {"field_name": "DescriptionDiagnostic", "value": "Gonarthrose primitive du genou droit", "confidence": 0.94, "source_file": "compte_rendu_chirurgical.pdf"},
            "facture:DateDebut": {"field_name": "DateDebut", "value": "03/06/2024", "confidence": 0.96, "source_file": "facture_hospitalisation.pdf"},
            "facture:DateFin": {"field_name": "DateFin", "value": "08/06/2024", "confidence": 0.95, "source_file": "facture_hospitalisation.pdf"},
            "facture:MontantTotal": {"field_name": "MontantTotal", "value": "8450.00", "confidence": 0.97, "source_file": "facture_hospitalisation.pdf"},
            "facture:NomEtablissement": {"field_name": "NomEtablissement", "value": "CHU de Tours — Service Orthopédie", "confidence": 0.93, "source_file": "facture_hospitalisation.pdf"},
            "decompte:PartSecu": {"field_name": "PartSecu", "value": "5040.00", "confidence": 0.96, "source_file": "decompte_securite_sociale.pdf"},
            "decompte:PartMutuelle": {"field_name": "PartMutuelle", "value": "2160.00", "confidence": 0.96, "source_file": "decompte_securite_sociale.pdf"},
            "decompte:ResteACharge": {"field_name": "ResteACharge", "value": "0.00", "confidence": 0.95, "source_file": "decompte_securite_sociale.pdf"},
            "compte_rendu:Chirurgien": {"field_name": "Chirurgien", "value": "Dr Laurent MICHAUD, CHU Tours", "confidence": 0.94, "source_file": "compte_rendu_chirurgical.pdf"},
            "compte_rendu:ProcedureCodes": {"field_name": "ProcedureCodes", "value": [
                {"valueObject": {"code": {"valueString": "CCAM NFKA007", "confidence": 0.96}, "description": {"valueString": "Prothèse totale de genou"}}},
                {"valueObject": {"code": {"valueString": "CCAM ZZQM006", "confidence": 0.93}, "description": {"valueString": "Consultation pré-anesthésique"}}},
                {"valueObject": {"code": {"valueString": "CCAM NZRB001", "confidence": 0.91}, "description": {"valueString": "Rééducation fonctionnelle"}}},
            ], "confidence": 0.94, "source_file": "compte_rendu_chirurgical.pdf"},
        },
        "confidence_summary": {
            "total_fields": 15,
            "average_confidence": 0.95,
            "high_confidence_count": 13,
            "medium_confidence_count": 2,
            "low_confidence_count": 0,
            "high_confidence_fields": [
                {"name": "declaration:NomAdherent", "confidence": 0.98},
                {"name": "declaration:NumeroAdherent", "confidence": 0.97},
                {"name": "facture:MontantTotal", "confidence": 0.97},
                {"name": "compte_rendu:CodeDiagnostic", "confidence": 0.97},
                {"name": "declaration:NumeroSinistre", "confidence": 0.96},
                {"name": "declaration:NumeroGroupe", "confidence": 0.96},
                {"name": "facture:DateDebut", "confidence": 0.96},
                {"name": "decompte:PartSecu", "confidence": 0.96},
                {"name": "decompte:PartMutuelle", "confidence": 0.96},
                {"name": "declaration:NomContrat", "confidence": 0.95},
                {"name": "facture:DateFin", "confidence": 0.95},
                {"name": "decompte:ResteACharge", "confidence": 0.95},
                {"name": "compte_rendu:ProcedureCodes", "confidence": 0.94},
            ],
            "medium_confidence_fields": [
                {"name": "compte_rendu:DescriptionDiagnostic", "confidence": 0.94},
                {"name": "facture:NomEtablissement", "confidence": 0.93},
            ],
            "low_confidence_fields": [],
        },
    }


def _arnaud_thierry_auto() -> Dict[str, Any]:
    """GRP-025 ARNAUD Thierry — collision frontale majeure, risque de fraude, enquête SIU."""
    return {
        "id": "app-pp-auto-001",
        "created_at": "2024-12-03T11:48:00Z",
        "external_reference": "GRP-025",
        "status": "under_investigation",
        "persona": "automotive_claims",
        "files": [
            {"filename": "constat_amiable.pdf", "path": "applications/app-pp-auto-001/constat_amiable.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "photo_dommages_avant.jpg", "path": "applications/app-pp-auto-001/photo_dommages_avant.jpg", "content_type": "image/jpeg", "media_type": "image"},
            {"filename": "photo_dommages_lateral.jpg", "path": "applications/app-pp-auto-001/photo_dommages_lateral.jpg", "content_type": "image/jpeg", "media_type": "image"},
            {"filename": "devis_reparation.pdf", "path": "applications/app-pp-auto-001/devis_reparation.pdf", "content_type": "application/pdf", "media_type": "document"},
            {"filename": "facture_remorquage.pdf", "path": "applications/app-pp-auto-001/facture_remorquage.pdf", "content_type": "application/pdf", "media_type": "document"},
        ],
        "llm_outputs": {
            "damage_assessment": {
                "visual_damage_analysis": {
                    "section": "damage_assessment",
                    "subsection": "visual_damage_analysis",
                    "raw": (
                        "Véhicule assuré : BMW Série 3 320d (2022), photographié au garage Prestige "
                        "Carrosserie Nancy. Dommages frontaux significatifs : pare-chocs avant détruit, "
                        "calandre brisée, capot plié avec déformation en V profonde. Traverse avant "
                        "repoussée d'environ 15 cm. Les deux blocs optiques fissurés. Ailes avant "
                        "présentant des plis de contrainte. À noter : rayures et oxydation préexistantes "
                        "sur l'aile avant gauche et la portière conducteur — incohérent avec un véhicule "
                        "de 2022 dans l'état déclaré. Le montant A côté droit semble intact, ce qui "
                        "est inhabituel compte tenu du scénario d'évitement déclaré."
                    ),
                    "parsed": {
                        "summary": "Dommages frontaux majeurs sur BMW Série 3. Le schéma de dommages soulève des interrogations — impact frontal direct incohérent avec la manœuvre d'évitement déclarée. Usure préexistante sur panneaux adjacents.",
                        "overall_severity": "severe",
                        "damage_areas": [
                            {"location": "Pare-chocs avant", "severity": "severe", "description": "Complètement détruit ; plastique fragmenté et détaché des points de fixation", "estimated_cost": 2800.00, "confidence": 0.88},
                            {"location": "Capot", "severity": "severe", "description": "Déformation en V profonde indiquant impact frontal direct ; décollement peinture aux pliures", "estimated_cost": 3200.00, "confidence": 0.86},
                            {"location": "Calandre et traverse avant", "severity": "severe", "description": "Calandre brisée ; traverse repoussée d'environ 15 cm vers l'arrière", "estimated_cost": 4500.00, "confidence": 0.84},
                            {"location": "Blocs optiques", "severity": "moderate", "description": "Les deux blocs fissurés ; optique gauche partiellement délogée", "estimated_cost": 1800.00, "confidence": 0.87},
                            {"location": "Ailes avant", "severity": "moderate", "description": "Plis de contrainte des deux côtés ; rayures et oxydation préexistantes sur aile gauche incohérentes avec l'âge du véhicule", "estimated_cost": 2200.00, "confidence": 0.79},
                            {"location": "Portière conducteur", "severity": "minor", "description": "Rayures et oxydation préexistantes — non cohérentes avec un véhicule de 2022", "estimated_cost": 0.00, "confidence": 0.72},
                        ],
                        "total_damage_estimate": 14500.00,
                        "airbag_deployment": False,
                        "vehicle_drivable": False,
                        "recommended_action": "Suspendre pour enquête SIU — incohérences dans le schéma de dommages",
                    },
                },
                "estimate_validation": {
                    "section": "damage_assessment",
                    "subsection": "estimate_validation",
                    "raw": (
                        "Devis du garage Prestige Carrosserie Nancy totalisant 14 500 €. Les tarifs "
                        "pièces OEM pour BMW Série 3 sont dans la fourchette haute mais conformes aux "
                        "prix catalogue BMW. La main-d'œuvre à 35 heures est à la limite supérieure "
                        "pour l'étendue des dommages documentés. Plusieurs postes nécessitent "
                        "des éclaircissements : le devis inclut un raccord peinture sur les panneaux "
                        "arrière qui ne sont pas adjacents à la zone d'impact. Peinture et matériaux "
                        "à 2 200 € dépassant la fourchette habituelle pour une remise en état frontale."
                    ),
                    "parsed": {
                        "summary": "Devis dans la fourchette haute. Plusieurs postes nécessitent justification.",
                        "estimate_id": "DEV-AT-2024-0891",
                        "parts_breakdown": 7800.00,
                        "labor_hours": 35,
                        "labor_rate_per_hour": 85.00,
                        "labor_cost": 2975.00,
                        "sublet_items": ["Equilibrage/géométrie : 350 €"],
                        "paint_materials": 2200.00,
                        "estimate_accuracy": "Fourchette haute — justification requise",
                        "comparison_market": "Au-dessus de la médiane",
                        "recommended_action": "Demander justification avant approbation",
                    },
                },
            },
            "liability_assessment": {
                "fault_determination": {
                    "section": "liability_assessment",
                    "subsection": "fault_determination",
                    "raw": (
                        "Le constat amiable rapporte que l'assuré a effectué une manœuvre d'évitement "
                        "sur la RN57 près de Nancy pour éviter un animal traversant la chaussée. "
                        "Le véhicule aurait percuté un poteau en béton. Aucun témoin indépendant. "
                        "L'absence de traces de freinage et le schéma de dommages (impact frontal "
                        "direct) sont difficiles à concilier avec un scénario d'évitement latéral. "
                        "Les dommages préexistants sur l'aile gauche questionnent l'état antérieur "
                        "du véhicule."
                    ),
                    "parsed": {
                        "summary": "Responsabilité contestée. Le scénario déclaré est incohérent avec les constatations physiques.",
                        "fault_determination": "En cours d'investigation",
                        "fault_percentage": 100,
                        "contributing_factors": [
                            "Aucun témoin indépendant",
                            "Absence de traces de freinage",
                            "Schéma de dommages incohérent avec le scénario déclaré",
                            "Dommages préexistants sur panneaux adjacents",
                        ],
                        "liability_risk": "Investigation requise",
                        "rationale": "Le schéma de dommages frontaux directs est incohérent avec une manœuvre d'évitement latéral.",
                    },
                },
            },
            "fraud_detection": {
                "red_flag_analysis": {
                    "section": "fraud_detection",
                    "subsection": "red_flag_analysis",
                    "raw": (
                        "Plusieurs indicateurs de fraude détectés. 1) Dommages préexistants sur "
                        "un véhicule de 2022 : rayures et oxydation de l'aile gauche et de la portière "
                        "incompatibles avec l'âge du véhicule. 2) Non-déploiement des airbags malgré "
                        "un impact frontal sévère avec traverse repoussée de 15 cm. 3) Incohérence "
                        "entre le scénario déclaré (évitement) et le schéma de dommages (impact "
                        "frontal direct). 4) Historique de sinistres multiples de l'assuré (3 sinistres "
                        "en 2 ans sur 2 véhicules différents). 5) Le devis inclut des réparations hors "
                        "zone d'impact (raccord peinture arrière). Transfert recommandé au Service "
                        "Investigation et Fraude (SIF)."
                    ),
                    "parsed": {
                        "summary": "5 indicateurs de fraude majeurs détectés. Transfert au SIF recommandé.",
                        "red_flags": [
                            {"category": "vehicle_condition", "indicator": "Dommages préexistants (rayures, oxydation) incohérents avec l'âge du véhicule (2022)", "severity": "high"},
                            {"category": "damage_pattern", "indicator": "Non-déploiement airbags malgré impact frontal sévère (traverse 15 cm)", "severity": "high"},
                            {"category": "scenario_inconsistency", "indicator": "Impact frontal direct incohérent avec manœuvre d'évitement déclarée", "severity": "high"},
                            {"category": "claims_history", "indicator": "3 sinistres en 2 ans sur 2 véhicules — fréquence anormale", "severity": "medium"},
                            {"category": "estimate_padding", "indicator": "Devis inclut réparations hors zone d'impact (raccord peinture arrière)", "severity": "medium"},
                        ],
                        "fraud_risk": "Élevé",
                        "fraud_score": 0.82,
                        "recommended_action": "Transférer au Service Investigation et Fraude (SIF)",
                    },
                },
            },
            "payout_recommendation": {
                "settlement_analysis": {
                    "section": "payout_recommendation",
                    "subsection": "settlement_analysis",
                    "raw": (
                        "Suspension de l'indemnisation recommandée en attendant les résultats de "
                        "l'enquête SIF. Le montant demandé de 14 500 € est dans la fourchette haute "
                        "et comporte des postes discutables. Expertise contradictoire recommandée. "
                        "Si le sinistre est confirmé, l'indemnisation devrait être limitée aux dommages "
                        "directement liés à l'accident, excluant les dommages préexistants et les "
                        "réparations hors zone d'impact. Franchise de 600 € applicable (malus suite "
                        "aux sinistres précédents)."
                    ),
                    "parsed": {
                        "summary": "Indemnisation suspendue. Expertise contradictoire et enquête SIF requises.",
                        "recommended_amount": 0.00,
                        "deductible": 600.00,
                        "insured_responsibility": 14500.00,
                        "subrogation_target": "Aucun — sinistre sans tiers identifié",
                        "final_approval": False,
                        "rationale": "Multiples incohérences détectées. Enquête SIF en cours. Expertise contradictoire mandatée.",
                        "policy_citations": [
                            {"policy_id": "AC-GRP-010", "title": "Conditions Générales Auto Groupama — Art. 15.3", "section": "Fraude et fausse déclaration", "text": "En cas de fausse déclaration ou de fraude avérée, Groupama peut refuser l'indemnisation et résilier le contrat.", "relevance": 0.97},
                            {"policy_id": "AC-GRP-011", "title": "Conditions Générales Auto Groupama — Art. 9.1", "section": "Expertise contradictoire", "text": "Groupama peut mandater un expert pour vérifier les circonstances du sinistre et le montant des dommages.", "relevance": 0.94},
                            {"policy_id": "AC-GRP-012", "title": "Conditions Générales Auto Groupama — Art. 8.5", "section": "Exclusion dommages préexistants", "text": "Les dommages préexistants au sinistre sont exclus de l'indemnisation.", "relevance": 0.91},
                        ],
                    },
                },
            },
        },
        "extracted_fields": {
            "constat:NumeroSinistre": {"field_name": "NumeroSinistre", "value": "SIN-AT-241203-01", "confidence": 0.95, "source_file": "constat_amiable.pdf"},
            "constat:NumeroPolice": {"field_name": "NumeroPolice", "value": "AUTO-GRP-2538714", "confidence": 0.93, "source_file": "constat_amiable.pdf"},
            "constat:NomAssure": {"field_name": "NomAssure", "value": "ARNAUD Thierry", "confidence": 0.97, "source_file": "constat_amiable.pdf"},
            "constat:DateSinistre": {"field_name": "DateSinistre", "value": "01/12/2024", "confidence": 0.94, "source_file": "constat_amiable.pdf"},
            "constat:AnneeVehicule": {"field_name": "AnneeVehicule", "value": "2022", "confidence": 0.96, "source_file": "constat_amiable.pdf"},
            "constat:MarqueVehicule": {"field_name": "MarqueVehicule", "value": "BMW", "confidence": 0.97, "source_file": "constat_amiable.pdf"},
            "constat:ModeleVehicule": {"field_name": "ModeleVehicule", "value": "Série 3 320d", "confidence": 0.95, "source_file": "constat_amiable.pdf"},
            "constat:Immatriculation": {"field_name": "Immatriculation", "value": "GH-892-LP", "confidence": 0.91, "source_file": "constat_amiable.pdf"},
            "constat:Circonstances": {"field_name": "Circonstances", "value": "Manœuvre d'évitement d'un animal sur RN57 — impact poteau béton", "confidence": 0.88, "source_file": "constat_amiable.pdf"},
            "devis:MontantReparation": {"field_name": "MontantReparation", "value": "14500.00", "confidence": 0.94, "source_file": "devis_reparation.pdf"},
            "remorquage:Montant": {"field_name": "Montant", "value": "285.00", "confidence": 0.92, "source_file": "facture_remorquage.pdf"},
            "remorquage:Societe": {"field_name": "Societe", "value": "Lorraine Dépannage Auto", "confidence": 0.65, "source_file": "facture_remorquage.pdf"},
        },
        "confidence_summary": {
            "total_fields": 12,
            "average_confidence": 0.92,
            "high_confidence_count": 8,
            "medium_confidence_count": 3,
            "low_confidence_count": 1,
            "high_confidence_fields": [
                {"name": "constat:NomAssure", "confidence": 0.97},
                {"name": "constat:MarqueVehicule", "confidence": 0.97},
                {"name": "constat:AnneeVehicule", "confidence": 0.96},
                {"name": "constat:NumeroSinistre", "confidence": 0.95},
                {"name": "constat:ModeleVehicule", "confidence": 0.95},
                {"name": "devis:MontantReparation", "confidence": 0.94},
                {"name": "constat:DateSinistre", "confidence": 0.94},
                {"name": "constat:NumeroPolice", "confidence": 0.93},
            ],
            "medium_confidence_fields": [
                {"name": "remorquage:Montant", "confidence": 0.92},
                {"name": "constat:Immatriculation", "confidence": 0.91},
                {"name": "constat:Circonstances", "confidence": 0.88},
            ],
            "low_confidence_fields": [
                {"name": "remorquage:Societe", "confidence": 0.65},
            ],
        },
    }


def get_claims_apps() -> List[Dict[str, Any]]:
    """Return seed data for 3 claims applications (1 health + 2 automotive)."""
    return [
        _garcia_antonio_auto(),
        _rousseau_marc_health(),
        _arnaud_thierry_auto(),
    ]
