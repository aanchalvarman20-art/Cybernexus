// ============================================
// THREAT INTELLIGENCE DATA
// ============================================

// Entity types and their configurations
const entityConfig = {
    'threat-actor': {
        color: '#ff4d6d',
        icon: '👤',
        label: 'Threat Actor'
    },
    'malware': {
        color: '#ff9d00',
        icon: '🦠',
        label: 'Malware'
    },
    'ip': {
        color: '#00d9ff',
        icon: '🌐',
        label: 'IP Address'
    },
    'domain': {
        color: '#b84dff',
        icon: '🔗',
        label: 'Domain'
    },
    'crypto': {
        color: '#00ff9f',
        icon: '💰',
        label: 'Crypto Wallet'
    }
};

// Sample threat intelligence entities
const threatEntities = [
    // Threat Actors
    {
        id: 'ta-001',
        type: 'threat-actor',
        name: 'APT-Crimson',
        description: 'Advanced persistent threat group specializing in ransomware attacks',
        severity: 'critical',
        confidence: 95,
        firstSeen: '2023-01-15',
        lastSeen: '2024-12-20',
        attributes: {
            origin: 'Eastern Europe',
            targets: 'Financial Institutions, Healthcare',
            tactics: 'Spear Phishing, Credential Theft',
            knownAliases: ['Crimson Bear', 'Red Dragon']
        }
    },
    {
        id: 'ta-002',
        type: 'threat-actor',
        name: 'Shadow Collective',
        description: 'Cybercriminal organization focused on data exfiltration',
        severity: 'high',
        confidence: 88,
        firstSeen: '2022-08-10',
        lastSeen: '2024-12-18',
        attributes: {
            origin: 'Southeast Asia',
            targets: 'Technology Companies, Government',
            tactics: 'SQL Injection, Zero-Day Exploits',
            knownAliases: ['Dark Shadow', 'Ghost Network']
        }
    },
    {
        id: 'ta-003',
        type: 'threat-actor',
        name: 'Nexus Syndicate',
        description: 'Organized crime group involved in cryptojacking and fraud',
        severity: 'high',
        confidence: 82,
        firstSeen: '2023-03-22',
        lastSeen: '2024-12-22',
        attributes: {
            origin: 'Unknown',
            targets: 'Small Businesses, E-commerce',
            tactics: 'Cryptojacking, Payment Card Skimming',
            knownAliases: ['Nexus Gang']
        }
    },
    
    // Malware
    {
        id: 'mal-001',
        type: 'malware',
        name: 'DarkCrypt Ransomware',
        description: 'Sophisticated ransomware with double extortion tactics',
        severity: 'critical',
        confidence: 97,
        firstSeen: '2023-02-01',
        lastSeen: '2024-12-21',
        attributes: {
            family: 'Ransomware',
            encryption: 'AES-256 + RSA-4096',
            ransom: '$500,000 - $5,000,000',
            affected: '120+ organizations'
        }
    },
    {
        id: 'mal-002',
        type: 'malware',
        name: 'StealthBot',
        description: 'Remote access trojan with keylogging capabilities',
        severity: 'high',
        confidence: 91,
        firstSeen: '2022-11-15',
        lastSeen: '2024-12-19',
        attributes: {
            family: 'RAT (Remote Access Trojan)',
            capabilities: 'Keylogging, Screen Capture, File Theft',
            distribution: 'Phishing Emails',
            affected: '50+ organizations'
        }
    },
    {
        id: 'mal-003',
        type: 'malware',
        name: 'CoinMiner-X',
        description: 'Cryptomining malware targeting cloud infrastructure',
        severity: 'medium',
        confidence: 85,
        firstSeen: '2023-06-10',
        lastSeen: '2024-12-20',
        attributes: {
            family: 'Cryptominer',
            target: 'Cloud Servers, Kubernetes Clusters',
            cryptocurrency: 'Monero (XMR)',
            affected: '80+ organizations'
        }
    },
    {
        id: 'mal-004',
        type: 'malware',
        name: 'PhishKit Pro',
        description: 'Advanced phishing toolkit with credential harvesting',
        severity: 'high',
        confidence: 89,
        firstSeen: '2023-04-05',
        lastSeen: '2024-12-22',
        attributes: {
            family: 'Phishing Kit',
            targets: 'Banking Credentials, Email Passwords',
            distribution: 'Compromised Websites',
            affected: '200+ domains'
        }
    },
    
    // IP Addresses
    {
        id: 'ip-001',
        type: 'ip',
        name: '185.220.101.45',
        description: 'C2 server hosting ransomware command infrastructure',
        severity: 'critical',
        confidence: 94,
        firstSeen: '2023-02-15',
        lastSeen: '2024-12-21',
        attributes: {
            location: 'Netherlands',
            asn: 'AS12345',
            isp: 'Unknown Hosting Provider',
            ports: '443, 8080, 9001'
        }
    },
    {
        id: 'ip-002',
        type: 'ip',
        name: '103.42.58.219',
        description: 'Malware distribution server',
        severity: 'high',
        confidence: 87,
        firstSeen: '2023-01-20',
        lastSeen: '2024-12-20',
        attributes: {
            location: 'Singapore',
            asn: 'AS67890',
            isp: 'VPS Hosting',
            ports: '80, 443'
        }
    },
    {
        id: 'ip-003',
        type: 'ip',
        name: '45.142.212.78',
        description: 'Phishing campaign infrastructure',
        severity: 'high',
        confidence: 90,
        firstSeen: '2023-04-10',
        lastSeen: '2024-12-22',
        attributes: {
            location: 'Russia',
            asn: 'AS24940',
            isp: 'BulletProof Hosting',
            ports: '80, 443, 8443'
        }
    },
    {
        id: 'ip-004',
        type: 'ip',
        name: '192.168.100.15',
        description: 'Internal network pivot point',
        severity: 'medium',
        confidence: 78,
        firstSeen: '2024-11-05',
        lastSeen: '2024-12-18',
        attributes: {
            location: 'Private Network',
            asn: 'N/A',
            isp: 'Private',
            ports: '22, 3389'
        }
    },
    
    // Domains
    {
        id: 'dom-001',
        type: 'domain',
        name: 'secure-bank-login.net',
        description: 'Phishing domain impersonating financial institution',
        severity: 'critical',
        confidence: 96,
        firstSeen: '2023-04-12',
        lastSeen: '2024-12-22',
        attributes: {
            registrar: 'NameCheap Inc',
            created: '2023-04-10',
            status: 'Active',
            nameservers: 'ns1.bulletproofhost.net'
        }
    },
    {
        id: 'dom-002',
        type: 'domain',
        name: 'update-microsoft.com',
        description: 'Malware distribution domain mimicking Microsoft',
        severity: 'high',
        confidence: 92,
        firstSeen: '2023-06-01',
        lastSeen: '2024-12-20',
        attributes: {
            registrar: 'GoDaddy',
            created: '2023-05-28',
            status: 'Active',
            nameservers: 'ns1.malicious-dns.net'
        }
    },
    {
        id: 'dom-003',
        type: 'domain',
        name: 'darkweb-marketplace.onion',
        description: 'Underground marketplace for stolen data',
        severity: 'critical',
        confidence: 88,
        firstSeen: '2022-09-15',
        lastSeen: '2024-12-19',
        attributes: {
            registrar: 'Tor Network',
            created: '2022-09-10',
            status: 'Active',
            network: 'Tor Hidden Service'
        }
    },
    
    // Cryptocurrency Wallets
    {
        id: 'cry-001',
        type: 'crypto',
        name: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        description: 'Bitcoin wallet receiving ransomware payments',
        severity: 'critical',
        confidence: 93,
        firstSeen: '2023-02-05',
        lastSeen: '2024-12-21',
        attributes: {
            currency: 'Bitcoin (BTC)',
            balance: '47.3 BTC (~$2.1M USD)',
            transactions: '234',
            associatedCampaigns: 'DarkCrypt Ransomware'
        }
    },
    {
        id: 'cry-002',
        type: 'crypto',
        name: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        description: 'Ethereum wallet linked to cryptojacking operations',
        severity: 'medium',
        confidence: 84,
        firstSeen: '2023-06-20',
        lastSeen: '2024-12-20',
        attributes: {
            currency: 'Ethereum (ETH)',
            balance: '125.8 ETH (~$420K USD)',
            transactions: '567',
            associatedCampaigns: 'CoinMiner-X'
        }
    },
    {
        id: 'cry-003',
        type: 'crypto',
        name: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Euq',
        description: 'Monero wallet for anonymous transactions',
        severity: 'high',
        confidence: 79,
        firstSeen: '2023-08-01',
        lastSeen: '2024-12-18',
        attributes: {
            currency: 'Monero (XMR)',
            balance: 'Hidden',
            transactions: 'Unknown',
            associatedCampaigns: 'Data Exfiltration'
        }
    }
];

// Network relationships (edges between entities)
const threatRelationships = [
    // APT-Crimson connections
    { source: 'ta-001', target: 'mal-001', type: 'uses', confidence: 95 },
    { source: 'ta-001', target: 'ip-001', type: 'operates', confidence: 92 },
    { source: 'ta-001', target: 'dom-001', type: 'controls', confidence: 88 },
    { source: 'ta-001', target: 'cry-001', type: 'receives-payment', confidence: 93 },
    
    // Shadow Collective connections
    { source: 'ta-002', target: 'mal-002', type: 'deploys', confidence: 90 },
    { source: 'ta-002', target: 'ip-002', type: 'operates', confidence: 85 },
    { source: 'ta-002', target: 'dom-003', type: 'sells-data-on', confidence: 82 },
    { source: 'ta-002', target: 'cry-003', type: 'receives-payment', confidence: 79 },
    
    // Nexus Syndicate connections
    { source: 'ta-003', target: 'mal-003', type: 'distributes', confidence: 87 },
    { source: 'ta-003', target: 'ip-003', type: 'operates', confidence: 84 },
    { source: 'ta-003', target: 'cry-002', type: 'receives-payment', confidence: 86 },
    
    // Infrastructure connections
    { source: 'mal-001', target: 'ip-001', type: 'c2-server', confidence: 94 },
    { source: 'mal-001', target: 'cry-001', type: 'payment-address', confidence: 95 },
    
    { source: 'mal-002', target: 'ip-002', type: 'c2-server', confidence: 88 },
    { source: 'mal-002', target: 'dom-002', type: 'hosted-on', confidence: 90 },
    
    { source: 'mal-003', target: 'cry-002', type: 'mining-wallet', confidence: 92 },
    { source: 'mal-003', target: 'ip-003', type: 'distribution', confidence: 85 },
    
    { source: 'mal-004', target: 'dom-001', type: 'phishing-site', confidence: 96 },
    { source: 'mal-004', target: 'ip-003', type: 'hosted-on', confidence: 91 },
    
    // Cross-connections (shared infrastructure)
    { source: 'ip-001', target: 'ip-002', type: 'linked-infrastructure', confidence: 75 },
    { source: 'dom-001', target: 'dom-002', type: 'similar-registration', confidence: 72 },
    { source: 'ta-001', target: 'ta-003', type: 'possible-collaboration', confidence: 68 }
];

// Recent threat detections for dashboard table
const recentThreats = [
    {
        timestamp: '2024-12-22 14:23:15',
        type: 'Ransomware',
        entity: 'DarkCrypt Ransomware',
        entityId: 'mal-001',
        severity: 'critical',
        confidence: 97,
        source: 'Network IDS'
    },
    {
        timestamp: '2024-12-22 13:45:30',
        type: 'Phishing',
        entity: 'secure-bank-login.net',
        entityId: 'dom-001',
        severity: 'critical',
        confidence: 96,
        source: 'Email Gateway'
    },
    {
        timestamp: '2024-12-22 12:18:42',
        type: 'C2 Communication',
        entity: '185.220.101.45',
        entityId: 'ip-001',
        severity: 'critical',
        confidence: 94,
        source: 'Firewall Logs'
    },
    {
        timestamp: '2024-12-22 11:05:20',
        type: 'Malware',
        entity: 'StealthBot',
        entityId: 'mal-002',
        severity: 'high',
        confidence: 91,
        source: 'Endpoint Detection'
    },
    {
        timestamp: '2024-12-22 10:33:55',
        type: 'Suspicious Traffic',
        entity: '103.42.58.219',
        entityId: 'ip-002',
        severity: 'high',
        confidence: 87,
        source: 'Network Monitor'
    },
    {
        timestamp: '2024-12-22 09:12:08',
        type: 'Cryptojacking',
        entity: 'CoinMiner-X',
        entityId: 'mal-003',
        severity: 'medium',
        confidence: 85,
        source: 'Cloud Security'
    },
    {
        timestamp: '2024-12-22 08:47:33',
        type: 'Phishing Kit',
        entity: 'PhishKit Pro',
        entityId: 'mal-004',
        severity: 'high',
        confidence: 89,
        source: 'Web Filter'
    },
    {
        timestamp: '2024-12-22 07:29:18',
        type: 'Malicious Domain',
        entity: 'update-microsoft.com',
        entityId: 'dom-002',
        severity: 'high',
        confidence: 92,
        source: 'DNS Logs'
    }
];

// AI Analysis Findings
const aiFindings = [
    {
        id: 'find-001',
        type: 'pattern',
        title: 'Shared Infrastructure Detected',
        description: 'APT-Crimson and Nexus Syndicate show overlapping infrastructure usage, suggesting possible collaboration or shared resources.',
        confidence: 68,
        timestamp: '2024-12-22 14:15:00',
        severity: 'high',
        entities: ['ta-001', 'ta-003', 'ip-001', 'ip-003']
    },
    {
        id: 'find-002',
        type: 'attribution',
        title: 'DarkCrypt Ransomware Attribution',
        description: 'High confidence attribution of DarkCrypt ransomware campaign to APT-Crimson based on TTPs and infrastructure overlap.',
        confidence: 95,
        timestamp: '2024-12-22 13:30:00',
        severity: 'critical',
        entities: ['ta-001', 'mal-001', 'ip-001', 'cry-001']
    },
    {
        id: 'find-003',
        type: 'cluster',
        title: 'New Phishing Network Identified',
        description: 'AI detected 15 related phishing domains with similar registration patterns and hosting infrastructure.',
        confidence: 89,
        timestamp: '2024-12-22 12:45:00',
        severity: 'high',
        entities: ['dom-001', 'dom-002', 'ip-003', 'mal-004']
    },
    {
        id: 'find-004',
        type: 'prediction',
        title: 'Potential Ransomware Campaign Escalation',
        description: 'Pattern analysis suggests APT-Crimson may be preparing for a large-scale ransomware campaign in the next 7-14 days.',
        confidence: 76,
        timestamp: '2024-12-22 11:20:00',
        severity: 'critical',
        entities: ['ta-001', 'mal-001']
    },
    {
        id: 'find-005',
        type: 'pattern',
        title: 'Cryptocurrency Mixing Service Usage',
        description: 'Multiple threat actors are using the same cryptocurrency mixing service, indicating potential shared money laundering infrastructure.',
        confidence: 82,
        timestamp: '2024-12-22 10:00:00',
        severity: 'medium',
        entities: ['cry-001', 'cry-002', 'cry-003']
    }
];

// Threat activity timeline data (for charts)
const threatTimeline = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
        {
            label: 'Critical',
            data: [12, 15, 23, 18, 28, 22, 19],
            borderColor: '#ff4d6d',
            backgroundColor: 'rgba(255, 77, 109, 0.1)',
            tension: 0.4
        },
        {
            label: 'High',
            data: [35, 42, 38, 45, 52, 48, 41],
            borderColor: '#ff9d00',
            backgroundColor: 'rgba(255, 157, 0, 0.1)',
            tension: 0.4
        },
        {
            label: 'Medium',
            data: [58, 62, 55, 68, 71, 65, 59],
            borderColor: '#ffd93d',
            backgroundColor: 'rgba(255, 217, 61, 0.1)',
            tension: 0.4
        }
    ]
};

// Threat distribution data (for pie chart)
const threatDistribution = {
    labels: ['Ransomware', 'Phishing', 'Malware', 'C2 Traffic', 'Data Exfiltration', 'Cryptojacking'],
    datasets: [{
        data: [23, 31, 18, 15, 8, 5],
        backgroundColor: [
            '#ff4d6d',
            '#ff9d00',
            '#ffd93d',
            '#00d9ff',
            '#b84dff',
            '#00ff9f'
        ]
    }]
};

// Search autocomplete suggestions
const searchSuggestions = [
    'APT-Crimson',
    'DarkCrypt Ransomware',
    '185.220.101.45',
    'secure-bank-login.net',
    'Shadow Collective',
    'StealthBot',
    'Nexus Syndicate',
    'CoinMiner-X',
    '103.42.58.219',
    'update-microsoft.com'
];

// Export all data
window.threatData = {
    entities: threatEntities,
    relationships: threatRelationships,
    recentThreats: recentThreats,
    aiFindings: aiFindings,
    threatTimeline: threatTimeline,
    threatDistribution: threatDistribution,
    searchSuggestions: searchSuggestions,
    entityConfig: entityConfig
};
