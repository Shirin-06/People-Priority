const projects = [
  {
    title: "Restore Water Supply",
    area: "Najafgarh Water Belt",
    score: 97,
    color: "#176b4d",
    meta: "400 reports, tanker delay evidence, 3.1 lakh people affected",
    department: "Delhi Jal Board",
    budget: "Rs 2.8 crore",
    summary:
      "Restore Water Supply is the top priority because water complaints are repeated across voice notes, photos, public meetings, and SMS. Population impact and heat-risk evidence make this urgent."
  },
  {
    title: "Repair Main Road",
    area: "Rohini Sector 11",
    score: 92,
    color: "#1d5f99",
    meta: "317 reports, school route disruption, high traffic density",
    department: "Public Works Department",
    budget: "Rs 1.6 crore",
    summary:
      "Repair Main Road ranks second because pothole reports overlap with school routes, ambulance movement, and a high-traffic bus corridor."
  },
  {
    title: "Upgrade Health Access",
    area: "Narela Rural Cluster",
    score: 88,
    color: "#b43b3b",
    meta: "Nearest hospital 24 km away, high elderly population",
    department: "Health Department",
    budget: "Rs 4.2 crore",
    summary:
      "Upgrade Health Access is recommended because hospital distance is high and complaints mention emergency delay, elderly residents, and poor transport links."
  },
  {
    title: "Install Street Lights",
    area: "Dwarka Pocket 8",
    score: 81,
    color: "#a77512",
    meta: "Night safety reports, bus stop footfall, 136 duplicates",
    department: "Municipal Corporation",
    budget: "Rs 58 lakh",
    summary:
      "Install Street Lights is a safety-focused project where complaint volume is moderate but night footfall and repeated reports raise the priority."
  }
];

const evidence = [
  ["POP", "Census and population", "3.1 lakh residents affected", "High", "Population weight added 18 points to the water project score."],
  ["HLT", "Hospital distance", "Nearest facility 24 km from Narela cluster", "Critical", "Health access risk added 15 points to the Narela recommendation."],
  ["EDU", "School disruption", "4 school routes overlap with road complaints", "High", "School-route disruption raised the Rohini road project above normal maintenance."],
  ["ENV", "Weather and tanker data", "Heatwave raises water urgency this week", "Rising", "Heat and tanker-delay signals raised urgency for immediate water restoration."]
];

const clusters = [
  ["Water shortage", "No water, tanker late, low pressure, pipeline dry", "612", "Merged from 612 raw complaints into 4 ward-level water cases."],
  ["Road damage", "Potholes, broken road, accident risk, repair pending", "481", "Grouped potholes, broken-road photos, and accident-risk text into one road theme."],
  ["Health access", "No hospital, clinic too far, ambulance delay", "286", "Merged rural health-centre requests with ambulance-delay reports."],
  ["Street lighting", "Dark lanes, unsafe stop, lights not working", "219", "Combined duplicate dark-lane reports by bus stop and residential lane."]
];

const hotspotCopy = {
  all: ["Najafgarh Water Belt", "400 complaints, 62% duplicate reports, 3.1 lakh people affected"],
  water: ["Najafgarh Water Belt", "Water shortage hotspot, tanker delay rising, 97% urgency"],
  road: ["Rohini Sector 11", "Road damage hotspot, school route overlap, 92% urgency"],
  health: ["Narela Rural Cluster", "Health access hotspot, hospital 24 km away, 88% urgency"]
};

const complaintSamples = {
  voice:
    "Voice transcript: The main road has deep potholes near the bus stand and ambulances are slowing down.",
  photo:
    "Photo analysis: Image appears to show stagnant drain water and garbage overflow near a residential lane.",
  sms: "SMS: Street lights near Pocket 8 are not working for three nights. Bus stop feels unsafe.",
  meeting:
    "Public meeting note: Residents requested reliable tanker timing and repair of a leaking water pipeline."
};

const heatPoints = {
  all: [
    [0.22, 0.28, 0.82, "#176b4d"],
    [0.42, 0.45, 0.72, "#1d5f99"],
    [0.68, 0.32, 0.68, "#b43b3b"],
    [0.78, 0.66, 0.55, "#a77512"],
    [0.32, 0.72, 0.48, "#1d5f99"]
  ],
  water: [
    [0.22, 0.28, 0.95, "#176b4d"],
    [0.31, 0.35, 0.52, "#176b4d"],
    [0.55, 0.72, 0.38, "#176b4d"]
  ],
  road: [
    [0.42, 0.45, 0.9, "#1d5f99"],
    [0.33, 0.72, 0.62, "#1d5f99"],
    [0.73, 0.53, 0.44, "#1d5f99"]
  ],
  health: [
    [0.68, 0.32, 0.88, "#b43b3b"],
    [0.76, 0.42, 0.44, "#b43b3b"]
  ]
};

const translations = {
  en: "Water supply in Najafgarh should be funded first because complaint volume is high, tanker dependency is rising, affected population is large, and the same issue is reported across voice, text, and field notes.",
  hi: "Najafgarh mein water supply ko pehle fund karna chahiye kyunki complaints zyada hain, tanker dependency badh rahi hai, affected population large hai, aur same issue voice, text aur field notes mein repeat ho raha hai.",
  ta: "Najafgarh water supply mudhal priority aaga fund seyyavendum; complaints adhigam, tanker dependency uyarndhadhu, affected population periyadhu, voice text field notes ellam same issue kaattugiradhu.",
  mr: "Najafgarh madhil water supply la pahile fund dya karan complaints jast aahet, tanker dependency vadht aahe, affected population mothi aahe, ani same issue voice, text ani field notes madhun yet aahe."
};

const priorityList = document.querySelector("#priorityList");
const evidenceList = document.querySelector("#evidenceList");
const clusterList = document.querySelector("#clusterList");
const canvas = document.querySelector("#heatmapCanvas");
const ctx = canvas.getContext("2d");
let selectedProject = 0;

function updateStatus(message) {
  document.querySelector("#statusFeed span").textContent = message;
}

function updateSummary(message) {
  document.querySelector("#aiSummary").textContent = message;
}

function renderPriority() {
  priorityList.innerHTML = projects
    .map(
      (project, index) => `
        <button type="button" class="priority-card record-button ${index === selectedProject ? "active" : ""}" data-project="${index}" style="--accent:${project.color}">
          <div class="priority-rank">
            <strong>${index + 1}. ${project.title}</strong>
            <span class="score">${project.score}%</span>
          </div>
          <p class="priority-meta">${project.area}<br>${project.meta}</p>
          <div class="meter" aria-label="Urgency ${project.score} percent">
            <span style="--width:${project.score}%"></span>
          </div>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProject = Number(button.dataset.project);
      const project = projects[selectedProject];
      renderPriority();
      updateSummary(`${project.summary} Suggested department: ${project.department}. Estimated budget: ${project.budget}.`);
      updateStatus(`${project.title} selected for review.`);
    });
  });
}

function renderEvidence() {
  evidenceList.innerHTML = evidence
    .map(
      ([code, title, detail, level], index) => `
        <button type="button" class="evidence-item record-button" data-evidence="${index}">
          <div class="source-badge">${code}</div>
          <div>
            <strong>${title}</strong>
            <span>${detail}</span>
          </div>
          <span class="pill">${level}</span>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-evidence]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-evidence]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const item = evidence[Number(button.dataset.evidence)];
      updateSummary(item[4]);
      updateStatus(`${item[1]} opened from dummy public-data layer.`);
    });
  });
}

function renderClusters() {
  clusterList.innerHTML = clusters
    .map(
      ([title, detail, count], index) => `
        <button type="button" class="cluster-item record-button" data-cluster="${index}">
          <div class="source-badge">${title.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>${title}</strong>
            <span>${detail}</span>
          </div>
          <span class="pill">${count}</span>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-cluster]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-cluster]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const item = clusters[Number(button.dataset.cluster)];
      updateSummary(`${item[0]} cluster: ${item[3]}`);
      updateStatus(`${item[2]} related complaints opened as a single AI cluster.`);
    });
  });
}

function drawMap(filter = "all") {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#eaf0f3";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#cbd5df";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 80 + i * 58);
    ctx.bezierCurveTo(220, 40 + i * 42, 420, 150 + i * 22, width, 86 + i * 46);
    ctx.stroke();
  }

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 10;
  const roads = [
    [80, 80, 760, 410],
    [160, 470, 820, 120],
    [420, 0, 500, 520],
    [0, 310, 900, 250]
  ];
  roads.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.strokeStyle = "#aebbc8";
  ctx.lineWidth = 2;
  roads.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  heatPoints[filter].forEach(([x, y, intensity, color]) => {
    const cx = x * width;
    const cy = y * height;
    const radius = 88 * intensity;
    const gradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
    gradient.addColorStop(0, `${color}dd`);
    gradient.addColorStop(0.45, `${color}80`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#17202a";
  ctx.font = "700 18px Inter, sans-serif";
  ctx.fillText("Najafgarh", width * 0.18, height * 0.25);
  ctx.fillText("Rohini", width * 0.4, height * 0.43);
  ctx.fillText("Narela", width * 0.66, height * 0.3);
  ctx.fillText("Dwarka", width * 0.74, height * 0.66);
}

function randomizeScan() {
  const complaints = 2486 + Math.floor(Math.random() * 180);
  const duplicates = 742 + Math.floor(Math.random() * 70);
  const confidence = 89 + Math.floor(Math.random() * 8);
  document.querySelector("#complaintCount").textContent = complaints.toLocaleString("en-IN");
  document.querySelector("#duplicateCount").textContent = duplicates.toLocaleString("en-IN");
  document.querySelector("#responseScore").textContent = `${confidence}%`;
  const project = projects[Math.floor(Math.random() * projects.length)];
  updateSummary(`AI scan complete. ${project.title} remains highly ranked in ${project.area}; ${project.department} can start the next review.`);
  updateStatus(`${complaints.toLocaleString("en-IN")} dummy complaints scanned and ${duplicates.toLocaleString("en-IN")} duplicates merged.`);
}

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    drawMap(button.dataset.filter);
    const [name, detail] = hotspotCopy[button.dataset.filter];
    document.querySelector("#topHotspot").textContent = name;
    document.querySelector(".map-card small").textContent = detail;
    updateStatus(`${button.textContent} hotspot layer loaded.`);
  });
});

document.querySelector("#languageSelect").addEventListener("change", (event) => {
  updateSummary(translations[event.target.value]);
  updateStatus(`${event.target.options[event.target.selectedIndex].text} AI brief loaded.`);
});

document.querySelector("#demoRefresh").addEventListener("click", randomizeScan);

document.querySelector("#loginDemo").addEventListener("click", () => {
  updateSummary("MP dashboard session opened with role-based dummy access: view priorities, approve project, notify department, export report.");
  updateStatus("Demo login successful as MP Office.");
});

document.querySelector("#exportReport").addEventListener("click", () => {
  const project = projects[selectedProject];
  updateSummary(`Report generated for ${project.title}: score ${project.score}%, department ${project.department}, budget ${project.budget}, area ${project.area}.`);
  updateStatus("PDF-style constituency report prepared from dummy data.");
});

document.querySelector("#notifyDept").addEventListener("click", () => {
  const project = projects[selectedProject];
  updateSummary(`${project.department} has been notified with complaint summary, hotspot map, evidence score, and recommended action for ${project.area}.`);
  updateStatus(`Notification queued to ${project.department}.`);
});

document.querySelector("#approveProject").addEventListener("click", () => {
  const project = projects[selectedProject];
  updateSummary(`${project.title} approved for planning review. Citizen acknowledgements and department task tickets were generated from dummy workflow data.`);
  updateStatus(`${project.title} moved to Approved for Planning.`);
});

document.querySelector("#submit").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = document.querySelector("#complaintInput").value.trim();
  const area = document.querySelector("#areaInput").value;
  const channel = document.querySelector("#channelInput").value;
  updateSummary(`New ${channel.toLowerCase()} complaint from ${area} was classified, merged with similar reports, and added to the priority score. Summary: ${text}`);
  updateStatus(`Complaint accepted from ${area}; acknowledgement ID PP-${Math.floor(1000 + Math.random() * 9000)} generated.`);
  randomizeScan();
});

document.querySelector("#voiceDemo").addEventListener("click", () => {
  document.querySelector("#channelInput").value = "WhatsApp Voice";
  document.querySelector("#complaintInput").value = complaintSamples.voice;
  updateStatus("Dummy voice note transcribed.");
});

document.querySelector("#photoDemo").addEventListener("click", () => {
  document.querySelector("#channelInput").value = "Photo Upload";
  document.querySelector("#complaintInput").value = complaintSamples.photo;
  updateStatus("Dummy photo analyzed with vision model.");
});

document.querySelectorAll(".quick-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    updateStatus(`${link.textContent} section opened.`);
  });
});

renderPriority();
renderEvidence();
renderClusters();
drawMap();
