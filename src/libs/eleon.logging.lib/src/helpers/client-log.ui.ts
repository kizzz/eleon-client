import { ClientLogService } from "./client-log.service";
import { ErrorHandlingLevel } from "@eleon/contracts.lib";

function getInfoIcon(color = "#ffffff") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="${color}" d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"/></svg>`;
}

function getWarningIcon(color = "#ffffff") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="${color}" d="M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72Zm-13.87 15.71a8.5 8.5 0 0 1-7.48 4.2H40.55a8.5 8.5 0 0 1-7.48-4.2a7.59 7.59 0 0 1 0-7.72l87.45-151.87a8.75 8.75 0 0 1 15 0l87.45 151.87a7.59 7.59 0 0 1-.04 7.72ZM120 144v-40a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12Z"/></svg>`;
}

function getChevronDownIcon(color = "#666666") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6l1.41-1.41z"/></svg>`;
}

function getIconForLogLevel(level: ErrorHandlingLevel) {
  switch (level) {
    case ErrorHandlingLevel.Debug:
      return getInfoIcon("#2563eb"); // Blue for debug
    case ErrorHandlingLevel.Error:
      return getWarningIcon("#ea580c"); // Orange for error
    case ErrorHandlingLevel.Critical:
      return getWarningIcon("#dc2626"); // Red for critical
    default:
      return getInfoIcon("#6b7280"); // Gray for unknown
  }
}


const STYLES = `
    #error-button {
      position: fixed;
      bottom: 10vh;
      right: 0px;
      z-index: 1000000;
      background-color: rgb(99, 102, 241);
      color: #fff;
      border: none;
      border-radius: 6px 0px 0px 6px;
      width: 40px;
      height: 40px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #error-button svg {
      width: 20px;
      height: 20px;
    }
    #error-button:hover {
      background-color: rgb(79, 82, 221);
    }
    #error-modal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 1000001;
      background-color: rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    #error-modal .modal-content {
      background-color: #fff;
      margin: 10vh auto;
      padding: 20px;
      border-radius: 5px;
      width: 95%;
      max-width: 1000px;
      height: 70vh;
      max-height: 70vh;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #error-modal .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      z-index: 1;
    }
    #error-list {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 20px;
    }
    #show-config-btn {
      flex-shrink: 0;
      margin-top: auto;
    }
    #config-json {
      flex-shrink: 0;
      max-height: 200px;
      overflow-y: auto;
    }
    .error-item {
      margin-bottom: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .error-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-color: #007bff;
    }
    .error-item.expanded {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
    }
    .error-item-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      background-color: #ffffff;
      transition: background-color 0.2s ease;
    }
    .error-item:hover .error-item-header {
      background-color: #f8f9fa;
    }
    .error-item.expanded .error-item-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    .error-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .error-icon svg {
      width: 100%;
      height: 100%;
    }
    .error-expand-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      margin-left: auto;
      margin-top: 2px;
      transition: transform 0.3s ease;
      opacity: 0.6;
    }
    .error-expand-icon.expanded {
      transform: rotate(180deg);
    }
    .error-expand-icon svg {
      width: 100%;
      height: 100%;
    }
    .error-content {
      flex: 1;
      min-width: 0;
    }
    .error-text {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .error-meta {
      font-size: 12px;
      color: #6c757d;
      margin-top: 4px;
    }
    .error-details {
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
      padding: 0;
      margin: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .error-details.expanded {
      max-height: 400px;
      padding: 15px;
      overflow-y: auto;
    }
    .error-details h4 {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 14px;
      font-weight: 600;
    }
    .error-details-content {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      color: #495057;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
      background-color: #ffffff;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ced4da;
      line-height: 1.4;
    }
    .error-details-section {
      margin-bottom: 15px;
    }
    .error-details-section:last-child {
      margin-bottom: 0;
    }
    .error-details-label {
      font-weight: 600;
      color: #343a40;
      margin-bottom: 5px;
      font-size: 13px;
    }
    .toggle-btn {
      background: none;
      border: none;
      color: #007bff;
      text-decoration: underline;
      cursor: pointer;
      font-size: 12px;
      margin-left: 10px;
    }
    .filters-container {
      display: flex;
      margin-bottom: 20px;
      padding: 0;
      background-color: transparent;
      border: none;
      border-radius: 0;
    }
    .filter-group {
      display: flex;
      flex: 1;
    }
    .filter-group.search-group {
      flex: 0 0 80%;
    }
    .filter-group.level-group {
      flex: 0 0 20%;
    }
    .filter-input {
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-right: none;
      border-radius: 4px 0 0 4px;
      font-size: 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .filter-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      z-index: 1;
      position: relative;
    }
    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 0 4px 4px 0;
      font-size: 14px;
      background-color: white;
      width: 100%;
      box-sizing: border-box;
    }
    .filter-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      z-index: 1;
      position: relative;
    }
  `;

export function initializeClientLogUI(){
  const style = document.createElement("style");
  style.textContent = STYLES;
  document.head.appendChild(style);

  // State management variables
  let isModalVisible = false;
  let isConfigVisible = false;
  let errorCount = 0;
  let configContent = "";
  let showWarning = false;
  let currentSearchQuery = "";
  let currentMinLevel = ErrorHandlingLevel.Critical; // Default to Critical
  
  // Create error button
  const errorButton = document.createElement("button");
  errorButton.id = "error-button";
  errorButton.style.display = "none";
  errorButton.onclick = () => {
    renderErrorModal();
    showModal();
  };
  
  const buttonIcon = document.createElement("span");
  errorButton.appendChild(buttonIcon);
  
  // Create modal structure
  const errorModal = document.createElement("div");
  errorModal.id = "error-modal";
  errorModal.style.display = "none";
  
  // Track if mouse down started outside modal content
  let mouseDownOutside = false;
  
  errorModal.onmousedown = (e: Event) => {
    mouseDownOutside = e.target === e.currentTarget;
  };
  
  errorModal.onclick = (e: Event) => {
    if (mouseDownOutside && e.target === e.currentTarget) {
      hideModal();
    }
  };
  
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  
  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.textContent = "×";
  closeBtn.onclick = () => hideModal();
  
  const title = document.createElement("h3");
  title.style.marginTop = "0";
  title.textContent = "System Log";
  
  // Create filters container
  const filtersContainer = document.createElement("div");
  filtersContainer.className = "filters-container";
  
  // Create search filter
  const searchGroup = document.createElement("div");
  searchGroup.className = "filter-group search-group";
  
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "filter-input";
  searchInput.placeholder = "Search logs...";
  searchInput.value = currentSearchQuery;
  searchInput.oninput = (e) => {
    currentSearchQuery = (e.target as HTMLInputElement).value;
    renderErrorModal();
  };
  
  searchGroup.appendChild(searchInput);
  
  // Create min level filter
  const levelGroup = document.createElement("div");
  levelGroup.className = "filter-group level-group";
  
  const levelSelect = document.createElement("select");
  levelSelect.className = "filter-select";
  
  // Add options for each error level
  const levelOptions = [
    { value: ErrorHandlingLevel.Debug, text: "Debug" },
    { value: ErrorHandlingLevel.Error, text: "Error" },
    { value: ErrorHandlingLevel.Critical, text: "Critical" }
  ];
  
  levelOptions.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value.toString();
    optionElement.textContent = option.text;
    if (option.value === currentMinLevel) {
      optionElement.selected = true;
    }
    levelSelect.appendChild(optionElement);
  });
  
  levelSelect.onchange = (e) => {
    currentMinLevel = parseInt((e.target as HTMLSelectElement).value) as ErrorHandlingLevel;
    renderErrorModal();
  };
  
  levelGroup.appendChild(levelSelect);
  
  // Assemble filters container
  filtersContainer.appendChild(searchGroup);
  filtersContainer.appendChild(levelGroup);
  
  const errorList = document.createElement("div");
  errorList.id = "error-list";
  
  const showConfigBtn = document.createElement("button");
  showConfigBtn.id = "show-config-btn";
  showConfigBtn.className = "toggle-btn";
  showConfigBtn.style.marginTop = "10px";
  showConfigBtn.textContent = "[Show Config JSON]";
  showConfigBtn.onclick = async () => {
    if (isConfigVisible) {
      hideConfig();
      return;
    }
    
    try {
      const config = await window['applicationConfiguration']?.getAppConfig?.();
      configContent = JSON.stringify(config, null, 2);
      showConfig();
    } catch (err) {
      configContent = "Failed to load configuration.";
      showConfig();
    }
  };
  
  const configPre = document.createElement("pre");
  configPre.id = "config-json";
  configPre.style.display = "none";
  configPre.style.marginTop = "10px";
  configPre.style.maxHeight = "300px";
  configPre.style.overflow = "auto";
  configPre.style.background = "#f9f9f9";
  configPre.style.padding = "10px";
  configPre.style.borderRadius = "5px";
  
  // Assemble modal
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(title);
  modalContent.appendChild(filtersContainer);
  modalContent.appendChild(errorList);
  modalContent.appendChild(showConfigBtn);
  modalContent.appendChild(configPre);
  errorModal.appendChild(modalContent);
  
  // Helper functions
  function showModal() {
    isModalVisible = true;
    errorModal.style.display = "block";
    updateFilterInputs();
  }
  
  function updateFilterInputs() {
    const searchInput = document.querySelector('.filter-input') as HTMLInputElement;
    const levelSelect = document.querySelector('.filter-select') as HTMLSelectElement;
    
    if (searchInput) {
      searchInput.value = currentSearchQuery;
    }
    
    if (levelSelect) {
      levelSelect.value = currentMinLevel.toString();
    }
  }
  
  function hideModal() {
    isModalVisible = false;
    errorModal.style.display = "none";
  }
  
  function showConfig() {
    isConfigVisible = true;
    configPre.style.display = "block";
    configPre.textContent = configContent;
    showConfigBtn.textContent = "[Hide Config JSON]";
  }
  
  function hideConfig() {
    isConfigVisible = false;
    configPre.style.display = "none";
    showConfigBtn.textContent = "[Show Config JSON]";
  }
  
  // Append components to DOM
  document.body.appendChild(errorModal);
  document.body.appendChild(errorButton);

  // Modal Logic - Now using ClientLogService with filtering
  function renderErrorModal() {
    // Get filtered logs from ClientLogService
    const filteredLogs = ClientLogService.Instance.getByFilter({
      minLevel: currentMinLevel,
      searchQuery: currentSearchQuery || undefined
    });
    
    const errorListElement = document.getElementById("error-list");
    if (!errorListElement) return;
    
    // Clear existing content
    errorListElement.innerHTML = "";

    // Show newest logs first by reversing the array
    const reversedLogs = [...filteredLogs].reverse();

    // Show message if no logs match the filter
    if (reversedLogs.length === 0) {
      const noResultsDiv = document.createElement("div");
      noResultsDiv.style.textAlign = "center";
      noResultsDiv.style.padding = "40px 20px";
      noResultsDiv.style.color = "#6c757d";
      noResultsDiv.style.fontSize = "14px";
      
      if (currentSearchQuery || currentMinLevel > ErrorHandlingLevel.Debug) {
        noResultsDiv.textContent = "No logs match the current filters.";
      } else {
        noResultsDiv.textContent = "No logs available.";
      }
      
      errorListElement.appendChild(noResultsDiv);
      return;
    }

    // Function to close all accordions
    function closeAllAccordions() {
      const allAccordions = errorListElement.querySelectorAll('.error-item.expanded');
      allAccordions.forEach(accordion => {
        const expandIcon = accordion.querySelector('.error-expand-icon');
        const details = accordion.querySelector('.error-details');
        
        accordion.classList.remove('expanded');
        if (details) details.classList.remove('expanded');
        if (expandIcon) expandIcon.classList.remove('expanded');
      });
    }

    // Create error items with accordion functionality
    reversedLogs.forEach((log, index) => {
      let isExpanded = false;
      
      // Get appropriate icon with color based on log level
      const iconSvg = getIconForLogLevel(log.level);
      
      // Create main error item container
      const errorItem = document.createElement("div");
      errorItem.className = "error-item";
      
      // Create header container
      const errorHeader = document.createElement("div");
      errorHeader.className = "error-item-header";
      
      // Create icon container
      const errorIcon = document.createElement("div");
      errorIcon.className = "error-icon";
      errorIcon.innerHTML = iconSvg;
      
      // Create content container
      const errorContent = document.createElement("div");
      errorContent.className = "error-content";
      errorContent.style.flex = "1";
      errorContent.style.minWidth = "0";
      
      // Create error text
      const errorText = document.createElement("div");
      errorText.className = "error-text";
      errorText.style.fontWeight = "600";
      errorText.style.whiteSpace = "nowrap";
      errorText.style.overflow = "hidden";
      errorText.style.textOverflow = "ellipsis";
      errorText.textContent = log.message || `Log ${index + 1}`;
      
      // Create meta information
      const metaParts = [
        log.source ? `Source: ${log.source}` : "",
        log.timestamp ? `Time: ${new Date(log.timestamp).toLocaleString()}` : "",
        log.level !== undefined ? `Level: ${ErrorHandlingLevel[log.level]}` : "",
        log.count > 1 ? `Count: ${log.count}` : ""
      ].filter(Boolean);
      
      const errorMeta = document.createElement("div");
      errorMeta.className = "error-meta";
      errorMeta.style.fontSize = "12px";
      errorMeta.style.color = "#6c757d";
      errorMeta.style.marginTop = "4px";
      if (metaParts.length > 0) {
        errorMeta.textContent = metaParts.join(" • ");
      }
      
      // Create expand icon
      const expandIcon = document.createElement("div");
      expandIcon.className = "error-expand-icon";
      expandIcon.innerHTML = getChevronDownIcon();
      
      // Create details section
      const errorDetails = document.createElement("div");
      errorDetails.className = "error-details";
      
      if (log.trace || log.source || log.timestamp || log.message) {
        // Create sections for different types of information
        const sections = [];
        
        if (log.message) {
          sections.push({
            label: "Full Message",
            content: log.message
          });
        }
        
        if (log.source) {
          sections.push({
            label: "Source",
            content: log.source
          });
        }
        
        if (log.timestamp) {
          sections.push({
            label: "Timestamp",
            content: new Date(log.timestamp).toISOString()
          });
        }
        
        if (log.level !== undefined) {
          sections.push({
            label: "Level",
            content: ErrorHandlingLevel[log.level]
          });
        }
        
        if (log.count > 1) {
          sections.push({
            label: "Occurrence Count",
            content: log.count.toString()
          });
        }
        
        if (log.trace) {
          sections.push({
            label: "Stack Trace",
            content: log.trace
          });
        }
        
        // Create the details content
        sections.forEach((section) => {
          const sectionDiv = document.createElement("div");
          sectionDiv.className = "error-details-section";
          
          const label = document.createElement("div");
          label.className = "error-details-label";
          label.textContent = section.label;
          
          const content = document.createElement("div");
          content.className = "error-details-content";
          content.textContent = section.content;
          
          sectionDiv.appendChild(label);
          sectionDiv.appendChild(content);
          errorDetails.appendChild(sectionDiv);
        });
      }
      
      // Add click handler for accordion functionality - only on header
      errorHeader.onclick = (e) => {
        e.stopPropagation();
        
        // If this accordion is being opened, close all others first
        if (!isExpanded) {
          closeAllAccordions();
        }
        
        isExpanded = !isExpanded;
        
        if (isExpanded) {
          errorItem.classList.add("expanded");
          errorDetails.classList.add("expanded");
          expandIcon.classList.add("expanded");
        } else {
          errorItem.classList.remove("expanded");
          errorDetails.classList.remove("expanded");
          expandIcon.classList.remove("expanded");
        }
      };
      
      // Prevent clicks on the details section from bubbling up to close the accordion
      errorDetails.onclick = (e) => {
        e.stopPropagation();
      };
      
      // Assemble the error item
      errorContent.appendChild(errorText);
      if (metaParts.length > 0) {
        errorContent.appendChild(errorMeta);
      }
      
      errorHeader.appendChild(errorIcon);
      errorHeader.appendChild(errorContent);
      errorHeader.appendChild(expandIcon);
      
      errorItem.appendChild(errorHeader);
      if (errorDetails.hasChildNodes()) {
        errorItem.appendChild(errorDetails);
      }
      
      errorListElement.appendChild(errorItem);
    });
  }

  function renderErrorButton() {
    // Get count from ClientLogService instead of window.environment
    const allLogs = ClientLogService.Instance.get();
    const count = allLogs.length;
    
    // Check if there are any Error or Critical level logs
    const hasError = allLogs.some(log => log.level == ErrorHandlingLevel.Error);
    const hasCritical = allLogs.some(log => log.level == ErrorHandlingLevel.Critical);

    errorCount = count;
    showWarning = hasError || hasCritical;

    // Update button display and icon
    errorButton.style.display = errorCount > 0 ? "block" : "none";
    buttonIcon.innerHTML = showWarning ? getWarningIcon(hasCritical ? "#FF5E3A" : "#FF5E3A") : getInfoIcon("#fff");
  }

  // Initialize the subscription
  ClientLogService.Instance.subscribe(() => {
      // Only update button count always
      renderErrorButton();
      
      // Only rerender modal if it's currently open
      if (isModalVisible) {
        renderErrorModal();
      }
    });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderErrorButton);
  } else {
    renderErrorButton();
  }
}