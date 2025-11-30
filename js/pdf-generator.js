/**
 * PDF Generator - Premium Professional PDFs
 * Magia Disney & Royal
 */

const PDFGenerator = {

    // Colors from brand
    colors: {
        primaryBlue: [30, 60, 114],      // #1e3c72
        primaryGold: [212, 175, 55],     // #d4af37
        accentGold: [244, 228, 193],     // #f4e4c1
        darkBlue: [15, 31, 61],          // #0f1f3d
        text: [51, 51, 51],              // #333
        textLight: [102, 102, 102],      // #666
        white: [255, 255, 255]
    },

    /**
     * Generate professional PDF from quote
     */
    async generatePDF(quote) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = margin;

        // ===== PAGE 1: HEADER & OVERVIEW =====

        // Gradient background header
        this.addGradientHeader(doc, pageWidth);

        // Logo
        await this.addLogo(doc, pageWidth, yPos);
        yPos += 50;

        // Quote ID & Date
        doc.setFontSize(10);
        doc.setTextColor(...this.colors.white);
        const quoteDate = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Cotización: ${quote.id}`, margin, yPos);
        doc.text(quoteDate, pageWidth - margin, yPos, { align: 'right' });
        yPos += 15;

        // Reset to normal background
        doc.setFillColor(...this.colors.white);
        doc.rect(0, yPos - 5, pageWidth, pageHeight - yPos + 5, 'F');

        // Client section
        doc.setFontSize(16);
        doc.setTextColor(...this.colors.primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.text('👤 Cliente', margin, yPos);
        yPos += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.colors.text);
        doc.text(quote.client?.name || 'Sin nombre', margin, yPos);
        yPos += 6;

        if (quote.client?.phone) {
            doc.setFontSize(10);
            doc.setTextColor(...this.colors.textLight);
            doc.text(`📱 ${quote.client.phone}`, margin, yPos);
            yPos += 5;
        }

        if (quote.client?.email) {
            doc.setFontSize(10);
            doc.text(`📧 ${quote.client.email}`, margin, yPos);
            yPos += 5;
        }

        yPos += 10;

        // Destination section - HIGHLIGHTED
        this.addHighlightBox(doc, margin, yPos - 5, pageWidth - 2 * margin, 30);

        doc.setFontSize(18);
        doc.setTextColor(...this.colors.primaryGold);
        doc.setFont('helvetica', 'bold');
        const type = Data.productTypes[quote.type] || Data.productTypes.otro;
        doc.text(`${type.icon} ${quote.product || 'Destino'}`, margin + 5, yPos + 5);
        yPos += 12;

        doc.setFontSize(11);
        doc.setTextColor(...this.colors.text);
        doc.setFont('helvetica', 'normal');
        if (quote.dates) {
            doc.text(`📅 ${quote.dates}`, margin + 5, yPos);
            yPos += 6;
        }
        if (quote.travelers) {
            doc.text(`👥 ${quote.travelers}`, margin + 5, yPos);
        }

        yPos += 20;

        // Pricing - BIG
        doc.setFontSize(14);
        doc.setTextColor(...this.colors.primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.text('💰 Inversión Total', margin, yPos);
        yPos += 8;

        doc.setFontSize(24);
        doc.setTextColor(...this.colors.primaryGold);
        doc.text(App.formatCurrency(quote.total || 0), margin, yPos);
        const config = Storage.getConfig();
        const mxnRate = parseFloat(config.quotes?.exchangeRate) || null;
        if (mxnRate && quote.total) {
            doc.setFontSize(10);
            doc.setTextColor(...this.colors.text);
            doc.text(`≈ ${App.formatCurrency(quote.total * mxnRate, 'MXN')} (tipo cambio ${mxnRate})`, margin, yPos + 6);
        }
        yPos += 12;

        // Payment plan
        const deposit = quote.deposit || 0;
        const months = Math.max(1, quote.months || 1);
        const monthly = typeof quote.monthly === 'number'
            ? quote.monthly
            : months > 0 ? Math.ceil(Math.max(0, (quote.total || 0) - deposit) / months) : 0;

        doc.setFontSize(10);
        doc.setTextColor(...this.colors.text);
        doc.setFont('helvetica', 'normal');
        doc.text(`💳 Apartado: ${App.formatCurrency(deposit)}`, margin, yPos);
        yPos += 5;
        doc.text(`📅 ${months} pagos mensuales de ${App.formatCurrency(monthly)}`, margin, yPos);
        yPos += 5;
        if (quote.deadline) {
            doc.text(`⏰ Pago final antes de: ${quote.deadline}`, margin, yPos);
        }
        if (quote.paymentPlan) {
            yPos += 6;
            doc.setTextColor(...this.colors.textLight);
            const schedule = doc.splitTextToSize(quote.paymentPlan, pageWidth - 2 * margin);
            doc.text(schedule, margin, yPos);
            yPos += schedule.length * 5;
        }

        yPos += 15;

        // Next steps / CTA
        if (quote.nextSteps || quote.paymentLink) {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }
            doc.setFontSize(12);
            doc.setTextColor(...this.colors.primaryBlue);
            doc.setFont('helvetica', 'bold');
            doc.text('✅ Qué sigue', margin, yPos);
            yPos += 6;

            doc.setFontSize(10);
            doc.setTextColor(...this.colors.text);
            doc.setFont('helvetica', 'normal');
            if (quote.nextSteps) {
                const steps = doc.splitTextToSize(quote.nextSteps, pageWidth - 2 * margin);
                steps.forEach((line, idx) => {
                    doc.text(`${idx + 1}. ${line}`, margin, yPos);
                    yPos += 5;
                });
            }
            if (quote.paymentLink) {
                yPos += 4;
                doc.setTextColor(...this.colors.primaryBlue);
                doc.text(`🔗 Link de pago: ${quote.paymentLink}`, margin, yPos);
            }
            yPos += 10;
        }

        // Itinerary
        if (quote.itinerary) {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }
            doc.setFontSize(12);
            doc.setTextColor(...this.colors.primaryBlue);
            doc.setFont('helvetica', 'bold');
            doc.text('🗺️ Itinerario sugerido', margin, yPos);
            yPos += 6;

            doc.setFontSize(10);
            doc.setTextColor(...this.colors.text);
            doc.setFont('helvetica', 'normal');
            const itineraryLines = quote.itinerary.split('\n').filter(i => i.trim());
            itineraryLines.forEach((line, index) => {
                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(`${index + 1}. ${line.trim()}`, margin, yPos);
                yPos += 5;
            });

            yPos += 10;
        }

        // Includes/Excludes
        if (quote.includes || quote.excludes) {
            const includesList = quote.includes?.split('\n').filter(i => i.trim()) || [];
            const excludesList = quote.excludes?.split('\n').filter(i => i.trim()) || [];

            const colWidth = (pageWidth - 3 * margin) / 2;

            // Includes
            if (includesList.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(...this.colors.primaryBlue);
                doc.setFont('helvetica', 'bold');
                doc.text('✅ Incluye', margin, yPos);
                yPos += 6;

                doc.setFontSize(9);
                doc.setTextColor(...this.colors.text);
                doc.setFont('helvetica', 'normal');
                includesList.forEach(item => {
                    if (yPos > pageHeight - 30) {
                        doc.addPage();
                        yPos = margin;
                    }
                    doc.text(`• ${item.trim()}`, margin + 3, yPos);
                    yPos += 4.5;
                });
            }

            // Excludes (in second column if space, or below)
            if (excludesList.length > 0) {
                let xPosExcludes = margin;
                let yPosExcludes = yPos;

                // Try to position in second column
                if (includesList.length > 0 && includesList.length < 8) {
                    xPosExcludes = margin + colWidth + margin;
                    yPosExcludes = yPos - (includesList.length * 4.5) - 6;
                } else {
                    yPosExcludes += 5;
                }

                doc.setFontSize(12);
                doc.setTextColor(...this.colors.primaryBlue);
                doc.setFont('helvetica', 'bold');
                doc.text('❌ No Incluye', xPosExcludes, yPosExcludes);
                yPosExcludes += 6;

                doc.setFontSize(9);
                doc.setTextColor(...this.colors.text);
                doc.setFont('helvetica', 'normal');
                excludesList.forEach(item => {
                    if (yPosExcludes > pageHeight - 30) {
                        doc.addPage();
                        yPosExcludes = margin;
                    }
                    doc.text(`• ${item.trim()}`, xPosExcludes + 3, yPosExcludes);
                    yPosExcludes += 4.5;
                });

                yPos = Math.max(yPos, yPosExcludes);
            }
        }

        yPos += 10;

        // Client notes
        if (quote.notesClient) {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }

            doc.setFontSize(12);
            doc.setTextColor(...this.colors.primaryBlue);
            doc.setFont('helvetica', 'bold');
            doc.text('📝 Notas', margin, yPos);
            yPos += 6;

            doc.setFontSize(10);
            doc.setTextColor(...this.colors.text);
            doc.setFont('helvetica', 'normal');
            const notes = doc.splitTextToSize(quote.notesClient, pageWidth - 2 * margin);
            doc.text(notes, margin, yPos);
            yPos += notes.length * 5;
        }

        // ===== FOOTER PAGE 1 =====
        this.addFooter(doc, pageHeight, pageWidth, margin, 1);

        // ===== PAGE 2: QR & CONTACT =====
        doc.addPage();
        yPos = margin + 10;

        // Contact section
        doc.setFontSize(16);
        doc.setTextColor(...this.colors.primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.text('📱 ¡Contacta con nosotros!', margin, yPos);
        yPos += 10;

        const phone = config.business?.phone || '55 8095 5139';

        // QR Code for WhatsApp
        const qrDataURL = await this.generateQRCode(quote, phone);
        if (qrDataURL) {
            const qrSize = 60;
            const qrX = (pageWidth - qrSize) / 2;
            doc.addImage(qrDataURL, 'PNG', qrX, yPos, qrSize, qrSize);
            yPos += qrSize + 8;

            doc.setFontSize(11);
            doc.setTextColor(...this.colors.text);
            doc.setFont('helvetica', 'normal');
            doc.text('Escanea para contactarnos por WhatsApp', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
        }

        // Contact details
        doc.setFontSize(12);
        doc.setTextColor(...this.colors.primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.text('📞 WhatsApp:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.colors.text);
        doc.text(phone, margin + 30, yPos);
        yPos += 8;

        if (config.business?.email) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...this.colors.primaryBlue);
            doc.text('📧 Email:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...this.colors.text);
            doc.text(config.business.email, margin + 30, yPos);
            yPos += 8;
        }

        if (config.business?.instagram) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...this.colors.primaryBlue);
            doc.text('📷 Instagram:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...this.colors.text);
            doc.text(config.business.instagram, margin + 30, yPos);
            yPos += 8;
        }

        if (quote.paymentLink) {
            yPos += 6;
            doc.setFontSize(11);
            doc.setTextColor(...this.colors.primaryBlue);
            doc.text('🔗 Link de pago', margin, yPos);
            doc.setFontSize(10);
            doc.setTextColor(...this.colors.text);
            const linkLines = doc.splitTextToSize(quote.paymentLink, pageWidth - 2 * margin);
            doc.text(linkLines, margin, yPos + 5);
            yPos += linkLines.length * 5 + 5;
        }

        yPos += 10;

        // Legal text
        if (config.quotes?.legalText) {
            doc.setFontSize(8);
            doc.setTextColor(...this.colors.textLight);
            doc.setFont('helvetica', 'italic');
            const legal = doc.splitTextToSize(config.quotes.legalText, pageWidth - 2 * margin);
            doc.text(legal, margin, yPos);
        }

        // Footer
        this.addFooter(doc, pageHeight, pageWidth, margin, 2);

        return doc;
    },

    /**
     * Add gradient header
     */
    addGradientHeader(doc, pageWidth) {
        // Blue to lighter blue gradient effect (manual)
        for (let i = 0; i < 60; i++) {
            const ratio = i / 60;
            const r = this.colors.primaryBlue[0] + (this.colors.primaryBlue[0] * 0.3 * ratio);
            const g = this.colors.primaryBlue[1] + (this.colors.primaryBlue[1] * 0.3 * ratio);
            const b = this.colors.primaryBlue[2] + (this.colors.primaryBlue[2] * 0.3 * ratio);
            doc.setFillColor(r, g, b);
            doc.rect(0, i, pageWidth, 1, 'F');
        }
    },

    /**
     * Add highlighted box
     */
    addHighlightBox(doc, x, y, width, height) {
        doc.setFillColor(...this.colors.accentGold);
        doc.setDrawColor(...this.colors.primaryGold);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, width, height, 2, 2, 'FD');
    },

    /**
     * Add logo to PDF
     */
    async addLogo(doc, pageWidth, yPos) {
        try {
            // Try to load the logo
            const logo = await this.loadImage('assets/logo-premium.jpg');
            const logoWidth = 80;
            const logoHeight = 40;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logo, 'JPEG', logoX, yPos, logoWidth, logoHeight);
        } catch (err) {
            // Fallback: text logo
            doc.setFontSize(20);
            doc.setTextColor(...this.colors.primaryGold);
            doc.setFont('helvetica', 'bold');
            doc.text('MAGIA', pageWidth / 2, yPos + 10, { align: 'center' });
            doc.setFontSize(16);
            doc.text('Disney & Royal', pageWidth / 2, yPos + 18, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Parques • Cruceros • Descuentos', pageWidth / 2, yPos + 24, { align: 'center' });
        }
    },

    /**
     * Load image as base64
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = src;
        });
    },

    /**
     * Generate QR code
     */
    async generateQRCode(quote, phone) {
        return new Promise((resolve) => {
            try {
                const container = document.createElement('div');
                container.style.display = 'none';
                document.body.appendChild(container);

                const message = `¡Hola! Me interesa la cotización ${quote.id} para ${quote.product}`;
                const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

                const qr = new QRCode(container, {
                    text: whatsappUrl,
                    width: 256,
                    height: 256,
                    colorDark: '#1e3c72',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                setTimeout(() => {
                    const canvas = container.querySelector('canvas');
                    if (canvas) {
                        const dataURL = canvas.toDataURL('image/png');
                        document.body.removeChild(container);
                        resolve(dataURL);
                    } else {
                        document.body.removeChild(container);
                        resolve(null);
                    }
                }, 100);
            } catch (err) {
                console.error('QR generation error:', err);
                resolve(null);
            }
        });
    },

    /**
     * Add footer
     */
    addFooter(doc, pageHeight, pageWidth, margin, pageNum) {
        const footerY = pageHeight - 15;

        // Line
        doc.setDrawColor(...this.colors.primaryGold);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        // Text
        doc.setFontSize(9);
        doc.setTextColor(...this.colors.textLight);
        doc.setFont('helvetica', 'normal');
        doc.text('✨ Magia Disney & Royal', margin, footerY);
        doc.text(`Página ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });

        // Watermark
        doc.setFontSize(60);
        doc.setTextColor(200, 200, 200);
        doc.setFont('helvetica', 'bold');
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.05 }));
        doc.text('MAGIA', pageWidth / 2, pageHeight / 2, {
            align: 'center',
            angle: 45
        });
        doc.restoreGraphicsState();
    },

    /**
     * Save PDF
     */
    savePDF(doc, quote) {
        const clientName = (quote.client?.name || 'Cliente').replace(/[^a-zA-Z0-9]/g, '-');
        const date = new Date().toISOString().split('T')[0];
        const filename = `MDR-${clientName}-${date}.pdf`;
        doc.save(filename);
    }
};

// Integrate with App
Object.assign(App, {
    async generatePDF() {
        const quote = this.state.viewingQuoteId
            ? Storage.getQuoteById(this.state.viewingQuoteId)
            : this.getQuoteFromForm?.();

        if (!quote) {
            this.showToast('❌ Error: Cotización no encontrada', 'error');
            return;
        }

        const errors = this.validateQuote ? this.validateQuote(quote) : [];
        if (errors.length > 0) {
            this.showToast('⚠️ ' + errors[0] + ' para exportar', 'warning');
            return;
        }

        this.setLoading?.(true);

        try {
            this.showToast('⏳ Generando PDF...', 'info');

            const doc = await PDFGenerator.generatePDF(quote);
            PDFGenerator.savePDF(doc, quote);

            this.showToast('✅ PDF generado exitosamente', 'success');
            Storage.incrementStat('pdfGenerated');
        } catch (err) {
            console.error('PDF generation error:', err);
            this.showToast('❌ Error al generar PDF', 'error');
        } finally {
            this.setLoading?.(false);
        }
    }
});
