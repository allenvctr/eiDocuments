"use client";

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { DocumentosService } from '@/services/documentosService';
import { Documento } from '@/types';

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documento: Documento; // Mudança: passar o documento completo em vez de URL
  onDownload?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  isOpen,
  onClose,
  documento,
  onDownload
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');

  // Extrair informações do documento
  const fileName = documento?.titulo || documento?.arquivo?.originalName || 'documento';
  const fileType = documento?.arquivo?.originalName?.split('.').pop()?.toLowerCase() || 'unknown';

  useEffect(() => {
    if (isOpen && documento?._id) {
      loadDocumentFromService();
    }
    
    return () => {
      // Limpar URL do blob ao fechar
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
        setDocumentUrl('');
      }
    };
  }, [isOpen, documento?._id]);

  const loadDocumentFromService = async () => {
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      // Baixar o documento como blob usando o service
      const blob = await DocumentosService.baixar(documento._id);
      setDocumentBlob(blob);

      // Criar URL temporária para o blob
      const blobUrl = URL.createObjectURL(blob);
      setDocumentUrl(blobUrl);

      // Processar baseado no tipo de arquivo
      await processDocument(blob, fileType);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar documento');
    } finally {
      setLoading(false);
    }
  };

  const processDocument = async (blob: Blob, type: string) => {
    const lowerFileType = type.toLowerCase();

    try {
      if (lowerFileType === 'pdf') {
        // PDF será processado pelo componente Document do react-pdf
        return;
      }

      if (['docx', 'doc'].includes(lowerFileType)) {
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
      } else if (['xlsx', 'xls'].includes(lowerFileType)) {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const htmlString = XLSX.utils.sheet_to_html(worksheet);
        setContent(htmlString);
      } else if (lowerFileType === 'csv') {
        // CSV pode ser tratado como planilha ou texto simples
        try {
          const text = await blob.text();
          const workbook = XLSX.read(text, { type: 'string' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const htmlString = XLSX.utils.sheet_to_html(worksheet);
          setContent(htmlString);
        } catch {
          // Se falhar, tratar como texto simples
          const text = await blob.text();
          setContent(text);
        }
      } else if (['txt', 'json', 'xml', 'html', 'css', 'js', 'ts', 'md', 'yaml', 'yml', 'log', 'ini', 'conf', 'config'].includes(lowerFileType)) {
        const text = await blob.text();
        setContent(text);
      }
    } catch (err) {
      throw new Error(`Erro ao processar arquivo ${lowerFileType}: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    }
  };

  const renderPDFPreview = () => (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Página {pageNumber} de {numPages || 1}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <Document
          file={documentUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setLoading(false);
          }}
          onLoadError={(error) => {
            setError('Erro ao carregar PDF');
            setLoading(false);
          }}
          loading={
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Carregando PDF...</span>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 100 : 800)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );

  const renderWordPreview = () => (
    <div className="h-full overflow-auto bg-white p-8">
      <div 
        className="max-w-4xl mx-auto prose prose-sm"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );

  const renderExcelPreview = () => (
    <div className="h-full overflow-auto bg-white p-4">
      <style jsx>{`
        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 12px;
        }
        table td, table th {
          border: 1px solid #ddd;
          padding: 4px 8px;
          text-align: left;
        }
        table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      `}</style>
      <div 
        className="w-full"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );

  const renderTextPreview = () => {
    const lowerFileType = fileType.toLowerCase();
    const isCode = ['js', 'ts', 'css', 'html', 'json', 'xml'].includes(lowerFileType);
    
    return (
      <div className="h-full overflow-auto bg-white">
        <pre className={`p-6 text-sm ${isCode ? 'bg-gray-900 text-green-400' : 'bg-white text-gray-900'} whitespace-pre-wrap`}>
          {content}
        </pre>
      </div>
    );
  };

  const renderImagePreview = () => (
    <div className="h-full flex items-center justify-center bg-gray-50 p-4">
      <img 
        src={documentUrl} 
        alt={fileName}
        className="max-w-full max-h-full object-contain shadow-lg rounded"
        onError={() => setError('Erro ao carregar imagem')}
      />
    </div>
  );

  const renderVideoPreview = () => (
    <div className="h-full flex items-center justify-center bg-black">
      <video 
        controls 
        className="max-w-full max-h-full"
        onError={() => setError('Erro ao carregar vídeo')}
      >
        <source src={documentUrl} type={`video/${fileType.toLowerCase()}`} />
        Seu navegador não suporta reprodução de vídeo.
      </video>
    </div>
  );

  const renderAudioPreview = () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-4">{fileName}</h3>
        <audio 
          controls 
          className="w-full max-w-md"
          onError={() => setError('Erro ao carregar áudio')}
        >
          <source src={documentUrl} type={`audio/${fileType.toLowerCase()}`} />
          Seu navegador não suporta reprodução de áudio.
        </audio>
      </div>
    </div>
  );

  const renderUnsupportedPreview = () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Preview não disponível
        </h3>
        <p className="text-gray-500 mb-4">
          Formato .{fileType} não suportado para visualização
        </p>
        <div className="space-y-2">
          <button 
            onClick={onDownload}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={!onDownload}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Baixar Arquivo
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Baixe o arquivo para visualizá-lo em um aplicativo apropriado
          </p>
        </div>
      </div>
    </div>
  );

  const getPreviewComponent = () => {
    const lowerFileType = fileType.toLowerCase();

    // PDF
    if (lowerFileType === 'pdf') {
      return renderPDFPreview();
    }

    // Documentos Word
    if (['docx', 'doc'].includes(lowerFileType)) {
      return renderWordPreview();
    }

    // Planilhas Excel
    if (['xlsx', 'xls', 'csv'].includes(lowerFileType)) {
      return renderExcelPreview();
    }

    // Imagens
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(lowerFileType)) {
      return renderImagePreview();
    }

    // Arquivos de texto e código
    if (['txt', 'json', 'xml', 'html', 'css', 'js', 'ts', 'md', 'yaml', 'yml', 'log', 'ini', 'conf', 'config'].includes(lowerFileType)) {
      return renderTextPreview();
    }

    // Vídeos
    if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', '3gp'].includes(lowerFileType)) {
      return renderVideoPreview();
    }

    // Áudios
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'].includes(lowerFileType)) {
      return renderAudioPreview();
    }

    // Arquivos não suportados
    return renderUnsupportedPreview();
  };

  if (!isOpen) return null;

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erro ao carregar arquivo
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
              {onDownload && (
                <button 
                  onClick={onDownload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Baixar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full h-full max-w-7xl max-h-[95vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex-1 min-w-0 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <h2 className="text-lg font-medium text-gray-900 truncate">
                {fileName}
              </h2>
              <p className="text-sm text-gray-500">
                {fileType.toUpperCase()} • Preview com bibliotecas nativas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando documento...</p>
              </div>
            </div>
          ) : (
            getPreviewComponent()
          )}
        </div>
      </div>
    </div>
  );
};