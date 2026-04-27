// Mock data for cases - multiple clusters with various incident types
// Each case includes createdAt for monthly report display in adminDashboard
// Total: ~200 cases across 8 clusters in Thammasat University Rangsit campus

// Helper to generate random date between March - April 2026
const randomDate = (month) => {
  const day = Math.floor(Math.random() * 25) + 1
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  return `2026-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`
}

// Helper to generate random status
const randomStatus = () => {
  const statuses = ['PENDING', 'IN_PROGRESS', 'FINISHED']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// Image URLs by category (from S3 bucket kor3)
const imageUrls = {
  road: [
    "https://kor3.s3.us-east-1.amazonaws.com/Pavement-Damage.jpg",
  ],
  streetlight: [
    "https://kor3.s3.us-east-1.amazonaws.com/Streetlight+Malfunction.webp",
  ],
  waste: [
    "https://kor3.s3.us-east-1.amazonaws.com/illegal-dumping.jpg",
  ],
  safety: [
    "https://kor3.s3.us-east-1.amazonaws.com/publicsaftyhazzard.jpg",
  ],
  flooding: [
    "https://kor3.s3.us-east-1.amazonaws.com/Flooding.jpg",
  ],
  tree: [
    "https://kor3.s3.us-east-1.amazonaws.com/treeHazzard.jpg",
  ],
  graffiti: [
    "https://kor3.s3.us-east-1.amazonaws.com/Graffiti.webp",
  ],
  noise: [
    "https://kor3.s3.us-east-1.amazonaws.com/construction-noise-pollution.jpg",
  ],
  air: [
    "https://kor3.s3.us-east-1.amazonaws.com/air-pollution.jpg",
  ],
  parking: [
    "https://kor3.s3.us-east-1.amazonaws.com/parking-violation.jpg",
  ],
}

const getRandomImage = (category) => {
  const urls = imageUrls[category] || imageUrls.road
  return urls[Math.floor(Math.random() * urls.length)]
}

// Cluster definitions for Thammasat University Rangsit campus
const clusters = [
  { name: "Central Plaza", lat: 14.0707, lon: 100.6056, count: 35 },
  { name: "Library Area", lat: 14.0715, lon: 100.6070, count: 30 },
  { name: "Engineering Faculty", lat: 14.0695, lon: 100.6075, count: 25 },
  { name: "Sports Complex", lat: 14.0720, lon: 100.6080, count: 25 },
  { name: "Dormitory Area", lat: 14.0685, lon: 100.6060, count: 30 },
  { name: "Business School", lat: 14.0730, lon: 100.6090, count: 25 },
  { name: "Arts Faculty", lat: 14.0675, lon: 100.6035, count: 20 },
  { name: "Medical Center", lat: 14.0740, lon: 100.6100, count: 20 },
]

// Incident types with descriptions
const incidentTypes = [
  {
    title: "Road & Pavement Damage",
    category: "road",
    descriptions: [
      "ถนนแตกร้าวรุนแรง ยางรถแตก",
      "ทางเท้าพังเดินลำบาก",
      "หลุมบ่อกลางถนนขนาดใหญ่",
      "ถนนยุบตัวหน้าอาคาร",
      "พื้นผิวถนนลื่นอันตราย",
      "รอยแตกร้าวบนผิวจราจร",
      "ฝาท่อระบายน้ำทรุดตัว",
      "ขอบถนนชำรุด",
      "สันจราจรหลุดหาย",
      "เครื่องหมายจราจรลบเลือน",
    ],
  },
  {
    title: "Streetlight Malfunction",
    category: "streetlight",
    descriptions: [
      "ไฟถนนดับทั้งเส้น มืดมาก",
      "หลอดไฟกระพริบตลอดเวลา",
      "เสาไฟเอียงอาจล้ม",
      "ไฟสว่างเกินไปรบกวนชุมชน",
      "สายไฟห้อยลงมาเสี่ยงอันตราย",
      "หลอดไฟเสียบางส่วน",
      "ไฟถนนติดตลอดกลางวัน",
      "ควบคุมไฟถนนเสีย",
      "ไฟถนนสว่างไม่เพียงพอ",
      "อุปกรณ์ไฟถนนชำรุด",
    ],
  },
  {
    title: "Illegal Dumping & Waste",
    category: "waste",
    descriptions: [
      "ขยะกองใหญ่ไม่มีคนเก็บ",
      "ทิ้งขยะหน้าห้องน้ำสาธารณะ",
      "ถังขยะเต็มล้น",
      "ขยะอันตรายตกในคูน้ำ",
      "เศษวัสดุก่อสร้างทิ้งกลางถนน",
      "ซากรถยนต์ทิ้งไว้นาน",
      "ขยะรีไซเคิลถูกทิ้งเกลื่อน",
      "ขยะอิเล็กทรอนิกส์ทิ้งผิดที่",
      "ขยะอันตรายไม่ได้จัดการ",
      "มูลฝอยกองเกลื่อน",
    ],
  },
  {
    title: "Public Safety Hazard",
    category: "safety",
    descriptions: [
      "ราวสะพานขาดหายอันตราย",
      "สายไฟฟ้าตกกระทบพื้น",
      "ฝาท่อระบายน้ำหาย",
      "ป้ายโฆษณาหลวมอาจตก",
      "ตะกร้าขยะล้มขวางทาง",
      "พื้นผิวไม่เท่ากัน",
      "รอยแตกร้าวบนทางเดิน",
      "วัสดุก่อสร้างกองขวางทาง",
      "เสาหมุดหายเกิดอันตราย",
      "พื้นลื่นไม่ปลอดภัย",
    ],
  },
  {
    title: "Flooding & Drainage Issues",
    category: "flooding",
    descriptions: [
      "น้ำขังหลังฝนตกหนัก",
      "ท่อระบายน้ำอุดตัน",
      "น้ำไหลจากที่สูงลงมาท่วม",
      "ฝาท่อระบายน้ำสกปรก",
      "คูน้ำตื้นเขินไม่ระบายน้ำ",
      "รางระบายน้ำเสียหาย",
      "น้ำท่วมขังบริเวณทางเดิน",
      "ท่อระบายน้ำรั่ว",
      "ระดับน้ำในคูสูงเกินปกติ",
      "ระบบระบายน้ำไม่ทำงาน",
    ],
  },
  {
    title: "Tree & Landscaping Hazards",
    category: "tree",
    descriptions: [
      "ต้นไม้ใหญ่ทาบกิ่งกระทบสายไฟ",
      "กิ่งไม้หักตกขวางทาง",
      "ต้นไม้เอียงอาจล้ม",
      "หญ้ารกปิดทางเดิน",
      "ใบไม้ร่วงเยอะทำทางลื่น",
      "ต้นไม้ต้องการตัดแต่ง",
      "รากไม้ทำให้พื้นเสียหาย",
      "ใบไม้บังป้ายจราจร",
      "กิ่งไม้เสียดสียานพาหนะ",
      "พุ่มไม้บดบังทัศนวิสัย",
    ],
  },
  {
    title: "Graffiti & Vandalism",
    category: "graffiti",
    descriptions: [
      "กราฟฟิตี้บนกำแพงโรงเรียน",
      "ผนังอาคารถูกเขียนข้อความ",
      "ป้ายบอกทางถูกขูดลบ",
      "ม้านั่งสาธารณะถูกทำลาย",
      "ถนนเขียนข้อความไม่เหมาะสม",
      "ศาลาพักผ่อนถูกทำลาย",
      "ตู้จดหมายถูกทุบทำลาย",
      "รั้วรอบอาคารถูกเขียน",
      "ที่นั่งในสวนสาธารณะเสียหาย",
      "อุปกรณ์กีฬาเสียหาย",
    ],
  },
  {
    title: "Noise Pollution",
    category: "noise",
    descriptions: [
      "เสียงเครื่องขยายดังมาก",
      "ก่อสร้างทำเสียงดังตอนกลางคืน",
      "เสียงดนตรีจากร้านอาหาร",
      "เสียงสุนัขเห่าตลอดคืน",
      "เสียงเครื่องจักรโรงงาน",
      "เสียงเครื่องปรับอากาศดัง",
      "เสียงกิจกรรมกลางคืน",
      "เสียงจากงานก่อสร้าง",
      "เสียงเครื่องเสียงดัง",
      "เสียงรบกวนจากหอพัก",
    ],
  },
  {
    title: "Air Pollution",
    category: "air",
    descriptions: [
      "ควันดำจากโรงงาน",
      "เผาขยะในที่สาธารณะ",
      "ฝุ่นละอองจากก่อสร้าง",
      "กลิ่นเหมือนจากท่อระบาย",
      "ควันรถบรรทุกหนัก",
      "ฝุ่นจากถนนแห้ง",
      "กลิ่นไม่พึงประสงค์",
      "มลพิษทางอากาศ",
      "ควันจากการเผาขยะ",
      "ฝุ่น PM2.5 สูง",
    ],
  },
  {
    title: "Parking Violation",
    category: "parking",
    descriptions: [
      "รถจอดบนทางเท้า",
      "รถจอดในเขตห้ามจอด",
      "รถบรรทุกจอดขวางทาง",
      "รถทิ้งไว้กลางถนน",
      "จักรยานยนต์จอดบนทางเท้า",
      "รถจอดบนเกาะกลาง",
      "รถจอดขวางทางหนีไฟ",
      "รถจอดในเขตทางเท้า",
      "รถจอดไม่เรียบร้อย",
      "รถจอดในที่ห้าม",
    ],
  },
]

// Generate mock cases
let caseId = 1
const mockCases = []

clusters.forEach((cluster) => {
  const casesInCluster = Math.floor(cluster.count / incidentTypes.length) + 1
  
  for (let i = 0; i < cluster.count; i++) {
    const incidentType = incidentTypes[i % incidentTypes.length]
    const description = incidentType.descriptions[Math.floor(Math.random() * incidentType.descriptions.length)]
    const month = Math.random() > 0.5 ? 3 : 4 // March or April
    
    // Add small random offset to lat/lon for variety
    const latOffset = (Math.random() - 0.5) * 0.002
    const lonOffset = (Math.random() - 0.5) * 0.002
    
    mockCases.push({
      caseId: `CASE${String(caseId).padStart(3, '0')}`,
      userId: "Ue714016cf2d1125a2bb009c88ebe878c",
      title: incidentType.title,
      description: description,
      lat: cluster.lat + latOffset,
      lon: cluster.lon + lonOffset,
      imageUrlBefore: getRandomImage(incidentType.category),
      status: randomStatus(),
      createdAt: randomDate(month),
    })
    caseId++
  }
})

export const getMockCases = () => mockCases
export { mockCases };

// Helper function to get cases by month for admin dashboard
export const getCasesByMonth = (year, month) => {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)
  
  return mockCases.filter(c => {
    const created = new Date(c.createdAt)
    return created >= startDate && created <= endDate
  })
}

// Helper function to get cases by status
export const getCasesByStatus = (status) => {
  return mockCases.filter(c => c.status === status)
}

// Helper function to get cases by type (title)
export const getCasesByType = (title) => {
  return mockCases.filter(c => c.title === title)
}

// Get summary statistics for dashboard
export const getCaseStatistics = () => {
  const total = mockCases.length
  const pending = mockCases.filter(c => c.status === 'PENDING').length
  const inProgress = mockCases.filter(c => c.status === 'IN_PROGRESS').length
  const completed = mockCases.filter(c => c.status === 'FINISHED').length
  
  // Count by type
  const byType = {}
  mockCases.forEach(c => {
    byType[c.title] = (byType[c.title] || 0) + 1
  })
  
  return {
    total,
    pending,
    inProgress,
    completed,
    byType,
  }
}