import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { buildEtiquetaQrPayload } from "@/lib/qrcode";
import { calculateLabelScale } from "@/config/labelSizePresets";

interface EtiquetaViewOptimizedProps {
  product: Product;
  largura?: number;
  altura?: number;
}

export function EtiquetaViewOptimized({ 
  product, 
  largura = 70, 
  altura = 50 
}: EtiquetaViewOptimizedProps) {
  const formatDate = (date: Date | undefined | string) => {
    if (!date) return '';
    
    try {
      if (typeof date === 'string') {
        if (date.includes('/')) {
          if (date.match(/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/)) {
            return date;
          } else if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            return date;
          } else if (date.match(/^\d{1,2}\/\d{4}$/)) {
            return date;
          }
        } else {
          const [year, month, day] = date.split('-').map(Number);
          if (year && month && day) {
            const dateObj = new Date(year, month - 1, day);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toLocaleDateString('pt-BR');
            }
          }
        }
      }
      
      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          return '';
        }
        return date.toLocaleDateString('pt-BR');
      }
      
      return String(date);
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '';
    }
  };

  // Conversão para pixels (1mm ≈ 3.78px)
  const screenWidth = `${largura * 3.78}px`;
  const screenHeight = `${altura * 3.78}px`;

  // Cálculo responsivo
  const scale = calculateLabelScale(largura, altura);
  const { fontSize, nameFontSize, qrSize } = scale;

  // Bordas e espaçamento
  const borderWidth = 2;
  const borderColor = '#000';
  const cellPadding = Math.max(3, fontSize * 0.4);

  return (
    <Card 
      className="etiqueta-impressao border-2 border-gray-400 bg-white overflow-hidden"
      style={{ 
        width: screenWidth,
        height: screenHeight,
      }}
    >
      <CardContent 
        className="font-sans h-full p-0"
        style={{ 
          fontSize: `${fontSize}px`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        
        {/* ===== HEADER: NOME DO PRODUTO ===== */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: `${nameFontSize}px`,
            padding: `${cellPadding}px`,
            borderBottom: `${borderWidth}px solid ${borderColor}`,
            textAlign: 'center',
            minHeight: `${nameFontSize + cellPadding * 2}px`,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.nome || ''}
          </span>
        </div>

        {/* ===== LOTE (Linha cheia) ===== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderBottom: `${borderWidth}px solid ${borderColor}`,
            minHeight: `${fontSize * 2 + cellPadding * 2}px`,
          }}
        >
          <div style={{ padding: `${cellPadding}px`, fontWeight: 'bold', fontSize: `${fontSize * 0.9}px` }}>
            LOTE:
          </div>
          <div style={{ padding: `${cellPadding}px`, paddingTop: 0 }}>
            {product.lote || ''}
          </div>
        </div>

        {/* ===== MARCA (Linha cheia) ===== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderBottom: `${borderWidth}px solid ${borderColor}`,
            minHeight: `${fontSize * 2 + cellPadding * 2}px`,
          }}
        >
          <div style={{ padding: `${cellPadding}px`, fontWeight: 'bold', fontSize: `${fontSize * 0.9}px` }}>
            MARCA:
          </div>
          <div style={{ padding: `${cellPadding}px`, paddingTop: 0 }}>
            {product.marca || ''}
          </div>
        </div>

        {/* ===== FABRICAÇÃO e VALIDADE (Lado a lado) ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: `${borderWidth}px solid ${borderColor}`,
            minHeight: `${fontSize * 2.5 + cellPadding * 2}px`,
          }}
        >
          {/* Fabricação */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRight: `${borderWidth}px solid ${borderColor}`,
            }}
          >
            <div style={{ padding: `${cellPadding}px`, fontWeight: 'bold', fontSize: `${fontSize * 0.9}px` }}>
              FABRIC.:
            </div>
            <div style={{ padding: `${cellPadding}px`, paddingTop: 0 }}>
              {formatDate(product.dataFabricacao) || ''}
            </div>
          </div>

          {/* Validade */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: `${cellPadding}px`, fontWeight: 'bold', fontSize: `${fontSize * 0.9}px` }}>
              VALID.:
            </div>
            <div style={{ padding: `${cellPadding}px`, paddingTop: 0 }}>
              {formatDate(product.validade) || ''}
            </div>
          </div>
        </div>

        {/* ===== ABERTURA e USAR ATÉ (Lado a lado) ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: `${borderWidth}px solid ${borderColor}`,
            minHeight: `${fontSize * 2.5 + cellPadding * 2}px`,
          }}
        >
          {/* Abertura */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRight: `${borderWidth}px solid ${borderColor}`,
            }}
          >
            <div style={{ padding: `${cellPadding}px`, fontWeight: 'bold', fontSize: `${fontSize * 0.9}px` }}>
              ABERTURA:
            </div>
            <div style={{ padding: `${cellPadding}px`, paddingTop: 0 }}>
              {formatDate(product.dataAbertura) || ''}
            </div>
          </div>

          {/* Usar até */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: `${cellPadding}px`, fontWeight: 'bold', fontSize: `${fontSize * 0.9}px` }}>
              USAR ATÉ:
            </div>
            <div style={{ padding: `${cellPadding}px`, paddingTop: 0 }}>
              {formatDate(product.utilizarAte) || ''}
            </div>
          </div>
        </div>

        {/* ===== CHECKBOXES (REF / CON / AMB) ===== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: `${fontSize * 1.5}px`,
            padding: `${cellPadding}px`,
            borderBottom: `${borderWidth}px solid ${borderColor}`,
            backgroundColor: '#f5f5f5',
            minHeight: `${fontSize * 1.8 + cellPadding * 2}px`,
            fontSize: `${fontSize * 0.95}px`,
            fontWeight: 'bold',
          }}
        >
          {/* REF */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${fontSize * 0.5}px` }}>
            <div
              style={{
                width: `${fontSize * 1.3}px`,
                height: `${fontSize * 1.3}px`,
                border: `2px solid #000`,
                backgroundColor: product.localArmazenamento === 'refrigerado' ? '#000' : '#fff',
                flexShrink: 0,
              }}
            />
            <span>REF</span>
          </div>

          {/* CON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${fontSize * 0.5}px` }}>
            <div
              style={{
                width: `${fontSize * 1.3}px`,
                height: `${fontSize * 1.3}px`,
                border: `2px solid #000`,
                backgroundColor: product.localArmazenamento === 'congelado' ? '#000' : '#fff',
                flexShrink: 0,
              }}
            />
            <span>CON</span>
          </div>

          {/* AMB */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${fontSize * 0.5}px` }}>
            <div
              style={{
                width: `${fontSize * 1.3}px`,
                height: `${fontSize * 1.3}px`,
                border: `2px solid #000`,
                backgroundColor: product.localArmazenamento === 'ambiente' ? '#000' : '#fff',
                flexShrink: 0,
              }}
            />
            <span>AMB</span>
          </div>
        </div>

        {/* ===== RESPONSÁVEL + QR CODE ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: `${cellPadding}px`,
            padding: `${cellPadding}px`,
            flex: 1,
            minHeight: `${Math.max(qrSize + cellPadding * 2, fontSize * 2 + cellPadding * 2)}px`,
          }}
        >
          {/* Responsável */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', fontSize: `${fontSize * 0.9}px`, marginBottom: `${cellPadding * 0.5}px` }}>
              RESPONSÁVEL:
            </div>
            <div style={{ fontSize: `${fontSize}px` }}>
              {product.responsavel || ''}
            </div>
          </div>

          {/* QR Code */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              padding: `${cellPadding * 0.5}px`,
              border: `1px solid #ccc`,
              minWidth: `${qrSize}px`,
              minHeight: `${qrSize}px`,
            }}
          >
            <QRCodeSVG
              value={buildEtiquetaQrPayload(product)}
              size={qrSize}
              level="L"
              marginSize={0}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
