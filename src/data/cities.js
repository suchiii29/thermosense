// ThermoSense AI - Indian Cities Dataset
// Includes geo-boundaries (polygons), climate baseline, and socioeconomic vulnerability metrics.

export const CITIES = {
  delhi: {
    name: "Delhi (NCT)",
    center: [77.2090, 28.6139],
    zoom: 11,
    description: "Delhi faces extreme summer heat waves compounded by high building density, dry microclimates, and strong local heating (the 'Loo' wind).",
    regionalRuralAvg: 37.5,
    zones: [
      {
        id: "delhi-cp",
        name: "Connaught Place & Central Secretariat",
        type: "Commercial Core",
        tempAnomaly: 4.8,
        temperature: 42.3,
        riskScore: 78,
        metrics: {
          albedo: 0.12,
          vegetationCover: 22,
          builtRatio: 78,
          populationDensity: 8500,
          incomeLevel: "high",
          greenSpaceAccess: 45
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "delhi-cp" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.2000, 28.6250],
              [77.2300, 28.6250],
              [77.2300, 28.6050],
              [77.2000, 28.6050],
              [77.2000, 28.6250] // Closed loop
            ]]
          }
        }
      },
      {
        id: "delhi-okhla",
        name: "Okhla Industrial Area",
        type: "Industrial Corridor",
        tempAnomaly: 7.2,
        temperature: 44.7,
        riskScore: 94,
        metrics: {
          albedo: 0.08,
          vegetationCover: 4,
          builtRatio: 92,
          populationDensity: 18000,
          incomeLevel: "medium",
          greenSpaceAccess: 5
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "delhi-okhla" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.2600, 28.5500],
              [77.2900, 28.5500],
              [77.2900, 28.5200],
              [77.2600, 28.5200],
              [77.2600, 28.5500]
            ]]
          }
        }
      },
      {
        id: "delhi-karolbagh",
        name: "Karol Bagh & Old Delhi",
        type: "High-Density Residential",
        tempAnomaly: 5.9,
        temperature: 43.4,
        riskScore: 88,
        metrics: {
          albedo: 0.10,
          vegetationCover: 8,
          builtRatio: 88,
          populationDensity: 42000,
          incomeLevel: "low",
          greenSpaceAccess: 12
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "delhi-karolbagh" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.1750, 28.6550],
              [77.2150, 28.6550],
              [77.2150, 28.6350],
              [77.1750, 28.6350],
              [77.1750, 28.6550]
            ]]
          }
        }
      },
      {
        id: "delhi-ridge",
        name: "Sanjay Van & Ridge Reserve",
        type: "Green Conservation Zone",
        tempAnomaly: -0.5,
        temperature: 37.0,
        riskScore: 15,
        metrics: {
          albedo: 0.25,
          vegetationCover: 84,
          builtRatio: 8,
          populationDensity: 400,
          incomeLevel: "high",
          greenSpaceAccess: 95
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "delhi-ridge" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.1450, 28.5350],
              [77.1750, 28.5350],
              [77.1750, 28.5050],
              [77.1450, 28.5050],
              [77.1450, 28.5350]
            ]]
          }
        }
      },
      {
        id: "delhi-yamuna",
        name: "Yamuna Informal Settlements",
        type: "Informal Settlement",
        tempAnomaly: 6.4,
        temperature: 43.9,
        riskScore: 92,
        metrics: {
          albedo: 0.11,
          vegetationCover: 10,
          builtRatio: 80,
          populationDensity: 58000,
          incomeLevel: "low",
          greenSpaceAccess: 8
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "delhi-yamuna" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.2350, 28.6750],
              [77.2650, 28.6750],
              [77.2650, 28.6450],
              [77.2350, 28.6450],
              [77.2350, 28.6750]
            ]]
          }
        }
      }
    ]
  },
  mumbai: {
    name: "Mumbai",
    center: [72.8777, 19.0760],
    zoom: 11,
    description: "Coastal humidity amplifies heat stress in Mumbai. Trapped heat in high-density informal zones like Dharavi represents a severe climate equity crisis.",
    regionalRuralAvg: 31.8,
    zones: [
      {
        id: "mumbai-bkc",
        name: "Bandra Kurla Complex (BKC)",
        type: "Commercial Core",
        tempAnomaly: 3.5,
        temperature: 35.3,
        riskScore: 68,
        metrics: {
          albedo: 0.14,
          vegetationCover: 12,
          builtRatio: 82,
          populationDensity: 9500,
          incomeLevel: "high",
          greenSpaceAccess: 20
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "mumbai-bkc" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [72.8550, 19.0700],
              [72.8850, 19.0700],
              [72.8850, 19.0500],
              [72.8550, 19.0500],
              [72.8550, 19.0700]
            ]]
          }
        }
      },
      {
        id: "mumbai-dharavi",
        name: "Dharavi & Kurla Hub",
        type: "Informal Settlement",
        tempAnomaly: 5.6,
        temperature: 37.4,
        riskScore: 95,
        metrics: {
          albedo: 0.09,
          vegetationCover: 2,
          builtRatio: 96,
          populationDensity: 75000,
          incomeLevel: "low",
          greenSpaceAccess: 2
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "mumbai-dharavi" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [72.8400, 19.0450],
              [72.8700, 19.0450],
              [72.8700, 19.0250],
              [72.8400, 19.0250],
              [72.8400, 19.0450]
            ]]
          }
        }
      },
      {
        id: "mumbai-sgnp",
        name: "Sanjay Gandhi National Park",
        type: "Green Conservation Zone",
        tempAnomaly: -1.2,
        temperature: 30.6,
        riskScore: 10,
        metrics: {
          albedo: 0.28,
          vegetationCover: 90,
          builtRatio: 3,
          populationDensity: 150,
          incomeLevel: "high",
          greenSpaceAccess: 98
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "mumbai-sgnp" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [72.8800, 19.2400],
              [72.9300, 19.2400],
              [72.9300, 19.1900],
              [72.8800, 19.1900],
              [72.8800, 19.2400]
            ]]
          }
        }
      },
      {
        id: "mumbai-trombay",
        name: "Trombay Industrial Corridor",
        type: "Industrial Corridor",
        tempAnomaly: 4.8,
        temperature: 36.6,
        riskScore: 82,
        metrics: {
          albedo: 0.07,
          vegetationCover: 6,
          builtRatio: 88,
          populationDensity: 11000,
          incomeLevel: "medium",
          greenSpaceAccess: 8
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "mumbai-trombay" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [72.9000, 19.0200],
              [72.9300, 19.0200],
              [72.9300, 18.9900],
              [72.9000, 18.9900],
              [72.9000, 19.0200]
            ]]
          }
        }
      },
      {
        id: "mumbai-colaba",
        name: "South Mumbai Heritage Core",
        type: "High-Density Residential",
        tempAnomaly: 2.2,
        temperature: 34.0,
        riskScore: 54,
        metrics: {
          albedo: 0.13,
          vegetationCover: 16,
          builtRatio: 76,
          populationDensity: 32000,
          incomeLevel: "high",
          greenSpaceAccess: 28
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "mumbai-colaba" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [72.8000, 18.9600],
              [72.8300, 18.9600],
              [72.8300, 18.9200],
              [72.8000, 18.9200],
              [72.8000, 18.9600]
            ]]
          }
        }
      }
    ]
  },
  bengaluru: {
    name: "Bengaluru",
    center: [77.5946, 12.9716],
    zoom: 11,
    description: "Rapid urbanization has reduced water bodies and vegetation cover, turning IT corridors and industrial parks into localized heat hubs.",
    regionalRuralAvg: 28.5,
    zones: [
      {
        id: "blr-majestic",
        name: "Majestic & Chickpet Core",
        type: "High-Density Residential",
        tempAnomaly: 4.5,
        temperature: 33.0,
        riskScore: 76,
        metrics: {
          albedo: 0.11,
          vegetationCover: 6,
          builtRatio: 90,
          populationDensity: 45000,
          incomeLevel: "low",
          greenSpaceAccess: 6
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "blr-majestic" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.5650, 12.9850],
              [77.5950, 12.9850],
              [77.5950, 12.9650],
              [77.5650, 12.9650],
              [77.5650, 12.9850]
            ]]
          }
        }
      },
      {
        id: "blr-whitefield",
        name: "Whitefield IT & Commercial Corridor",
        type: "Commercial Core",
        tempAnomaly: 5.1,
        temperature: 33.6,
        riskScore: 80,
        metrics: {
          albedo: 0.13,
          vegetationCover: 10,
          builtRatio: 85,
          populationDensity: 12000,
          incomeLevel: "high",
          greenSpaceAccess: 14
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "blr-whitefield" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.7200, 12.9800],
              [77.7600, 12.9800],
              [77.7600, 12.9500],
              [77.7200, 12.9500],
              [77.7200, 12.9800]
            ]]
          }
        }
      },
      {
        id: "blr-peenya",
        name: "Peenya Industrial Area",
        type: "Industrial Corridor",
        tempAnomaly: 6.3,
        temperature: 34.8,
        riskScore: 90,
        metrics: {
          albedo: 0.08,
          vegetationCover: 3,
          builtRatio: 93,
          populationDensity: 14000,
          incomeLevel: "medium",
          greenSpaceAccess: 4
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "blr-peenya" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.5000, 13.0400],
              [77.5300, 13.0400],
              [77.5300, 13.0100],
              [77.5000, 13.0100],
              [77.5000, 13.0400]
            ]]
          }
        }
      },
      {
        id: "blr-cubbon",
        name: "Cubbon Park & Botanical Core",
        type: "Green Conservation Zone",
        tempAnomaly: -0.8,
        temperature: 27.7,
        riskScore: 12,
        metrics: {
          albedo: 0.24,
          vegetationCover: 82,
          builtRatio: 12,
          populationDensity: 800,
          incomeLevel: "high",
          greenSpaceAccess: 94
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "blr-cubbon" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.5900, 12.9820],
              [77.6100, 12.9820],
              [77.6100, 12.9620],
              [77.5900, 12.9620],
              [77.5900, 12.9820]
            ]]
          }
        }
      },
      {
        id: "blr-ecity",
        name: "Electronic City Phase I & II",
        type: "Commercial Core",
        tempAnomaly: 3.8,
        temperature: 32.3,
        riskScore: 72,
        metrics: {
          albedo: 0.15,
          vegetationCover: 15,
          builtRatio: 78,
          populationDensity: 9000,
          incomeLevel: "high",
          greenSpaceAccess: 25
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "blr-ecity" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.6600, 12.8600],
              [77.6900, 12.8600],
              [77.6900, 12.8300],
              [77.6600, 12.8300],
              [77.6600, 12.8600]
            ]]
          }
        }
      }
    ]
  },
  hyderabad: {
    name: "Hyderabad",
    center: [78.4867, 17.3850],
    zoom: 11,
    description: "Hyderabad's semi-arid environment, combined with rocky terrain and heavy concrete building surfaces, creates severe urban micro-clime warming.",
    regionalRuralAvg: 36.2,
    zones: [
      {
        id: "hyd-hitec",
        name: "Hitec City & Gachibowli",
        type: "Commercial Core",
        tempAnomaly: 5.3,
        temperature: 41.5,
        riskScore: 84,
        metrics: {
          albedo: 0.12,
          vegetationCover: 8,
          builtRatio: 86,
          populationDensity: 11000,
          incomeLevel: "high",
          greenSpaceAccess: 12
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "hyd-hitec" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.3500, 17.4600],
              [78.3900, 17.4600],
              [78.3900, 17.4300],
              [78.3500, 17.4300],
              [78.3500, 17.4600]
            ]]
          }
        }
      },
      {
        id: "hyd-charminar",
        name: "Charminar & Old City Core",
        type: "High-Density Residential",
        tempAnomaly: 4.8,
        temperature: 41.0,
        riskScore: 82,
        metrics: {
          albedo: 0.10,
          vegetationCover: 5,
          builtRatio: 92,
          populationDensity: 48000,
          incomeLevel: "low",
          greenSpaceAccess: 4
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "hyd-charminar" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.4600, 17.3700],
              [78.4900, 17.3700],
              [78.4900, 17.3400],
              [78.4600, 17.3400],
              [78.4600, 17.3700]
            ]]
          }
        }
      },
      {
        id: "hyd-kbr",
        name: "KBR National Park Reserve",
        type: "Green Conservation Zone",
        tempAnomaly: -0.6,
        temperature: 35.6,
        riskScore: 16,
        metrics: {
          albedo: 0.26,
          vegetationCover: 80,
          builtRatio: 10,
          populationDensity: 900,
          incomeLevel: "high",
          greenSpaceAccess: 90
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "hyd-kbr" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.4100, 17.4300],
              [78.4350, 17.4300],
              [78.4350, 17.4100],
              [78.4100, 17.4100],
              [78.4100, 17.4300]
            ]]
          }
        }
      },
      {
        id: "hyd-balanagar",
        name: "Balanagar Industrial Zone",
        type: "Industrial Corridor",
        tempAnomaly: 6.9,
        temperature: 43.1,
        riskScore: 92,
        metrics: {
          albedo: 0.08,
          vegetationCover: 2,
          builtRatio: 94,
          populationDensity: 13000,
          incomeLevel: "medium",
          greenSpaceAccess: 3
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "hyd-balanagar" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.4300, 17.4900],
              [78.4600, 17.4900],
              [78.4600, 17.4600],
              [78.4300, 17.4600],
              [78.4300, 17.4900]
            ]]
          }
        }
      },
      {
        id: "hyd-informal",
        name: "Musarambagh Low-Income Settlement",
        type: "Informal Settlement",
        tempAnomaly: 5.8,
        temperature: 42.0,
        riskScore: 89,
        metrics: {
          albedo: 0.11,
          vegetationCover: 7,
          builtRatio: 82,
          populationDensity: 39000,
          incomeLevel: "low",
          greenSpaceAccess: 7
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "hyd-informal" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.5000, 17.3800],
              [78.5300, 17.3800],
              [78.5300, 17.3500],
              [78.5000, 17.3500],
              [78.5000, 17.3800]
            ]]
          }
        }
      }
    ]
  },
  chennai: {
    name: "Chennai",
    center: [80.2707, 13.0827],
    zoom: 11,
    description: "Chennai experiences high relative humidity and significant coastal heating, compounded by industrial hotspots on the city's northern coast.",
    regionalRuralAvg: 34.5,
    zones: [
      {
        id: "chn-tnagar",
        name: "T. Nagar Shopping District",
        type: "Commercial Core",
        tempAnomaly: 4.1,
        temperature: 38.6,
        riskScore: 79,
        metrics: {
          albedo: 0.12,
          vegetationCover: 6,
          builtRatio: 92,
          populationDensity: 29000,
          incomeLevel: "medium",
          greenSpaceAccess: 8
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "chn-tnagar" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [80.2200, 13.0500],
              [80.2500, 13.0500],
              [80.2500, 13.0300],
              [80.2200, 13.0300],
              [80.2200, 13.0500]
            ]]
          }
        }
      },
      {
        id: "chn-ennore",
        name: "Ennore Industrial & Port Area",
        type: "Industrial Corridor",
        tempAnomaly: 6.5,
        temperature: 41.0,
        riskScore: 92,
        metrics: {
          albedo: 0.09,
          vegetationCover: 5,
          builtRatio: 88,
          populationDensity: 9000,
          incomeLevel: "low",
          greenSpaceAccess: 6
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "chn-ennore" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [80.3000, 13.2300],
              [80.3400, 13.2300],
              [80.3400, 13.1900],
              [80.3000, 13.1900],
              [80.3000, 13.2300]
            ]]
          }
        }
      },
      {
        id: "chn-guindy",
        name: "Guindy National Park Reserve",
        type: "Green Conservation Zone",
        tempAnomaly: -0.8,
        temperature: 33.7,
        riskScore: 14,
        metrics: {
          albedo: 0.25,
          vegetationCover: 83,
          builtRatio: 10,
          populationDensity: 600,
          incomeLevel: "high",
          greenSpaceAccess: 95
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "chn-guindy" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [80.2000, 13.0150],
              [80.2250, 13.0150],
              [80.2250, 12.9950],
              [80.2000, 12.9950],
              [80.2000, 13.0150]
            ]]
          }
        }
      },
      {
        id: "chn-vyasarpadi",
        name: "Vyasarpadi Informal Sector",
        type: "Informal Settlement",
        tempAnomaly: 5.4,
        temperature: 39.9,
        riskScore: 88,
        metrics: {
          albedo: 0.11,
          vegetationCover: 4,
          builtRatio: 90,
          populationDensity: 52000,
          incomeLevel: "low",
          greenSpaceAccess: 3
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "chn-vyasarpadi" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [80.2400, 13.1200],
              [80.2700, 13.1200],
              [80.2700, 13.1000],
              [80.2400, 13.1000],
              [80.2400, 13.1200]
            ]]
          }
        }
      },
      {
        id: "chn-omr",
        name: "OMR IT Infrastructure Corridor",
        type: "Commercial Core",
        tempAnomaly: 4.6,
        temperature: 39.1,
        riskScore: 81,
        metrics: {
          albedo: 0.13,
          vegetationCover: 9,
          builtRatio: 84,
          populationDensity: 14000,
          incomeLevel: "high",
          greenSpaceAccess: 10
        },
        geojson: {
          type: "Feature",
          properties: { zoneId: "chn-omr" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [80.2300, 12.9600],
              [80.2600, 12.9600],
              [80.2600, 12.9200],
              [80.2300, 12.9200],
              [80.2300, 12.9600]
            ]]
          }
        }
      }
    ]
  }
};
export default CITIES;
