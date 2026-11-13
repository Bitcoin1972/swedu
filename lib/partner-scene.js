const registry = require('../content/partner-registry.json');

// Author confirmation is recorded separately from independently inspected agreements.
const confirmation = { source: 'User confirmation in SWE chat', date: '2026-11-13', agreementsConfirmed: true, agreementDocumentsInspected: false };
const copy = {
  en: { title: 'Your connected ecosystem', subtitle: 'Education, technology and institutions in cooperation.', who: 'Who they are', relationship: 'Cooperation with Smart World Education', back: 'Return to the journey', website: 'Official website', profile: 'Professional representative', choose: 'Select an organisation', contribution: 'Mutual contribution', role: 'Founder & Senior Partner · DRF Conflict Management Solutions LLP', biography: 'Vinita Sahay is an advocate, international mediator, arbitrator and conciliator. Her work connects dispute resolution, professional training and institutional conflict-management capability. Her supplied professional CV identifies her as Founder and Senior Partner of DRF Conflict Management Solutions LLP.' },
  de: { title: 'Dein verbundenes Ökosystem', subtitle: 'Bildung, Technologie und Institutionen in Zusammenarbeit.', who: 'Wer sie sind', relationship: 'Zusammenarbeit mit Smart World Education', back: 'Zurück zur Reise', website: 'Offizielle Website', profile: 'Fachliche Ansprechpartnerin', choose: 'Organisation auswählen', contribution: 'Gegenseitiger Beitrag', role: 'Gründerin & Senior Partner · DRF Conflict Management Solutions LLP', biography: 'Vinita Sahay ist Rechtsanwältin, internationale Mediatorin, Schiedsrichterin und Schlichterin. Ihre Arbeit verbindet Streitbeilegung, berufliche Weiterbildung und institutionelle Kompetenz im Konfliktmanagement. Ihr bereitgestellter beruflicher Lebenslauf nennt sie als Gründerin und Senior Partner von DRF Conflict Management Solutions LLP.' },
  hi: { title: 'आपका जुड़ा हुआ इकोसिस्टम', subtitle: 'सहयोग में शिक्षा, प्रौद्योगिकी और संस्थान।', who: 'संगठन का परिचय', relationship: 'Smart World Education के साथ सहयोग', back: 'यात्रा पर वापस जाएँ', website: 'आधिकारिक वेबसाइट', profile: 'पेशेवर प्रतिनिधि', choose: 'संगठन चुनें', contribution: 'पारस्परिक योगदान', role: 'संस्थापक और वरिष्ठ भागीदार · DRF Conflict Management Solutions LLP', biography: 'Vinita Sahay अधिवक्ता, अंतरराष्ट्रीय मध्यस्थ, पंच और सुलहकर्ता हैं। उनका कार्य विवाद समाधान, पेशेवर प्रशिक्षण और संस्थागत विवाद-प्रबंधन क्षमता को जोड़ता है। उनके प्रदान किए गए पेशेवर जीवनवृत्त में उन्हें DRF Conflict Management Solutions LLP की संस्थापक और वरिष्ठ भागीदार बताया गया है।' }
};
function preview() {
 return { copy, records: registry.records.filter(record => record.publicationApproved).map(record => ({
  id: record.id, name: record.officialName, website: record.website,
  description: record.id === 'aigc' ? { en:'AI Governance Corridor connects governance research, policy and capability development.', de:'AI Governance Corridor verbindet Governance-Forschung, Politik und Kompetenzentwicklung.', hi:'AI Governance Corridor शासन अनुसंधान, नीति और क्षमता विकास को जोड़ता है।' } : record.id === 'ambedkar-sonepat' ? {en:'Dr. B.R. Ambedkar National Law University is a law university in Sonepat, Haryana.',de:'Die Dr. B.R. Ambedkar National Law University ist eine juristische Universität in Sonepat, Haryana.',hi:'Dr. B.R. Ambedkar National Law University हरियाणा के सोनीपत में स्थित विधि विश्वविद्यालय है।'} : record.description,
  logo: record.logo.assetPath && record.logo.permissionStatus === 'user-authorised' ? '/' + record.logo.assetPath.replace(/^public\//,'') : null,
  editorial: record.editorial,
  representative: record.id === 'drf-world' ? { name:'Vinita Sahay', portrait:'/images/partners/vinita-sahay.png' } : null
 })) };
}
module.exports = { preview, confirmation };
