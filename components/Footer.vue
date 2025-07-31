<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section contact">
        <span class="footer-text">
          <a 
            href="https://forms.gle/UnPGrsVaxoR5m6QK8" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer-link"
          >
            Comparte tu malla 
          </a>
        </span>
      </div>
      
      <div class="footer-section created-by">
        <span class="footer-text">Creado por 
          <a 
            href="https://www.linkedin.com/in/nrojasgg/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer-link"
          >
            onicalls
          </a>
        </span>
      </div>
      
      <div class="footer-section source-code">
        <a 
          href="https://github.com/onicalls/mallas-usach" 
          target="_blank" 
          rel="noopener noreferrer"
          class="footer-link"
        >
          Código fuente
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 20px 0;
  margin-top: 40px;
  width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-section {
  flex: 1;
  min-width: 120px;
}

.footer-section.contact {
  text-align: left;
}

.footer-section.created-by {
  text-align: center;
}

.footer-section.source-code {
  text-align: right;
}

.footer-text {
  color: #6c757d;
  font-size: 14px;
  font-weight: 400;
}

.footer-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

.footer-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .footer-section {
    text-align: center !important;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 15px 0;
  }
  
  .footer-content {
    padding: 0 15px;
    gap: 10px;
  }
  
  .footer-text,
  .footer-link {
    font-size: 13px;
  }
}
</style>
