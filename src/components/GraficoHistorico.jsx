// src/components/GraficoHistorico.jsx

// Importa o React e os hooks useState e useEffect
import React, { useState, useEffect } from 'react';
// Importa componentes da biblioteca Recharts para criar o gráfico
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// Importa o componente de spinner de carregamento (ajuste o caminho se necessário)
import LoadingSpinner from './LoadingSpinner';
// Importa funções utilitárias para formatar o eixo X e o tooltip (ajuste o caminho)
import { formatXAxis, formatTooltipLabel } from '../utils/formatters';

// Define o componente funcional GraficoHistorico, que recebe props: titulo, endpoint e alturaGrafico (com valor padrão)
const GraficoHistorico = ({ titulo, endpoint, alturaGrafico = 300 }) => {
  // Declara o estado 'dados' para armazenar os dados do gráfico, inicializado como um array vazio
  const [dados, setDados] = useState([]);
  // Declara o estado 'isLoading' para controlar a exibição do spinner, inicializado como true
  const [isLoading, setIsLoading] = useState(true);
  // Declara o estado 'erro' para armazenar mensagens de erro, inicializado como null
  const [erro, setErro] = useState(null);

  // Função para transformar os dados recebidos da API no formato esperado pelo gráfico
  const formatarDadosParaGrafico = (dadosApi) =>
    // Verifica se dadosApi é um array
    Array.isArray(dadosApi)
      ? dadosApi
          // Mapeia cada item do array da API para um novo objeto
          .map((item) => ({
            // Converte a string 'created_on' para um timestamp numérico (milissegundos)
            timestamp: new Date(item.created_on).getTime(),
            // Garante que 'nivel' seja um número; se não for, define como null
            nivel: typeof item.nivel === 'number' ? item.nivel : null,
          }))
          // Filtra itens que não têm um timestamp válido (NaN) ou cujo nível é null
          .filter((item) => !isNaN(item.timestamp) && item.nivel !== null)
          // Ordena os dados pelo timestamp em ordem crescente, essencial para gráficos de linha
          .sort((a, b) => a.timestamp - b.timestamp)
      // Se dadosApi não for um array, retorna um array vazio para evitar erros
      : [];

  // Hook useEffect para buscar dados quando o componente é montado ou quando 'endpoint' muda
  useEffect(() => {
    // Se não houver um 'endpoint' fornecido, limpa os dados, para o carregamento e reseta erros
    if (!endpoint) {
      setDados([]);          // Limpa os dados existentes
      setIsLoading(false);   // Define o carregamento como falso
      setErro(null);         // Limpa qualquer erro anterior
      return;                // Encerra a execução do efeito
    }

    // Define uma função assíncrona para buscar os dados
    const fetchDados = async () => {
      setIsLoading(true);    // Inicia o estado de carregamento
      setErro(null);         // Limpa erros anteriores antes de uma nova busca
      try {
        // Faz a requisição HTTP GET para o 'endpoint' fornecido
        const res = await fetch(endpoint);
        // Se a resposta não for bem-sucedida (status HTTP não for 2xx)
        if (!res.ok) {
          // Prepara uma mensagem de erro padrão
          let errorMsg = `Falha ao buscar dados (${res.status})`;
          try {
            // Tenta parsear o corpo da resposta como JSON para obter uma mensagem de erro mais detalhada
            const errorBody = await res.json();
            // Se houver um campo 'detail' no corpo do erro, usa ele, senão mantém a mensagem padrão
            errorMsg = errorBody?.detail || errorMsg;
          } catch (jsonError) {
            // Se o parse do JSON falhar, ignora e usa a mensagem de erro padrão (já definida)
          }
          // Lança um erro com a mensagem construída
          throw new Error(errorMsg);
        }
        // Se a resposta for bem-sucedida, parseia o corpo como JSON
        const dataApi = await res.json();
        // Formata os dados recebidos e atualiza o estado 'dados'
        setDados(formatarDadosParaGrafico(dataApi));
      } catch (err) {
        // Se ocorrer qualquer erro durante o fetch ou processamento, atualiza o estado 'erro'
        setErro(err.message);
      } finally {
        // Independentemente de sucesso ou falha, define o carregamento como falso ao final
        setIsLoading(false);
      }
    };
    // Chama a função para buscar os dados
    fetchDados();
  }, [endpoint]); // O array de dependências: o efeito re-executa se 'endpoint' mudar

  // Retorna a estrutura JSX do componente
  return (
    // Contêiner principal do gráfico com estilos Tailwind CSS para aparência e layout
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 transition-shadow hover:shadow-xl border border-slate-700 flex flex-col min-h-[350px]">
      {/* Título do gráfico */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-slate-100 border-b pb-2 border-slate-700">
        {titulo}
      </h2>
      {/* Contêiner para o conteúdo do gráfico (spinner, erro, gráfico real ou mensagem de 'sem dados') */}
      {/* 'flex-grow' faz este div ocupar o espaço restante verticalmente */}
      {/* 'minHeight' garante que o gráfico tenha pelo menos a altura especificada pela prop 'alturaGrafico' */}
      <div className="flex-grow" style={{ minHeight: `${alturaGrafico}px` }}>
        {/* Renderização condicional baseada nos estados 'isLoading', 'erro' e 'dados' */}
        {isLoading ? ( // Se estiver carregando
          <div style={{ height: `${alturaGrafico}px` }} className="flex items-center justify-center">
            <LoadingSpinner mensagem="Carregando dados..." /> {/* Exibe o spinner de carregamento */}
          </div>
        ) : erro ? ( // Se houver um erro
          <div style={{ height: `${alturaGrafico}px` }} className="flex flex-col items-center justify-center text-center">
            <p className="text-red-400 font-semibold">Erro ao carregar:</p> {/* Mensagem de erro */}
            <p className="text-red-300 text-sm">{erro}</p> {/* Detalhes do erro */}
          </div>
        ) : dados.length > 0 ? ( // Se não estiver carregando, não houver erro, e houver dados
          // Contêiner responsivo do Recharts que ajusta o tamanho do gráfico ao seu pai
          <ResponsiveContainer width="100%" height={alturaGrafico}>
            {/* Componente LineChart do Recharts, que recebe os dados e define margens */}
            <LineChart data={dados} margin={{ top: 5, right: 30, left: -15, bottom: 5 }}>
              {/* Grade cartesiana para o fundo do gráfico */}
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              {/* Eixo X (horizontal) */}
              <XAxis
                dataKey="timestamp" // Chave dos dados para o eixo X
                tickFormatter={formatXAxis} // Função para formatar os rótulos do eixo X
                stroke="#94a3b8" // Cor da linha e dos ticks do eixo X
                tick={{ fontSize: 10 }} // Estilo dos ticks (rótulos)
                interval="preserveStartEnd" // Controla como os ticks são exibidos (aqui, garante início e fim)
                minTickGap={35} // Espaçamento mínimo entre os ticks
              />
              {/* Eixo Y (vertical) */}
              <YAxis
                stroke="#94a3b8" // Cor da linha e dos ticks do eixo Y
                tick={{ fontSize: 10 }} // Estilo dos ticks
                domain={[0, 'dataMax + 5']} // Define o domínio do eixo Y (de 0 até o valor máximo dos dados + 5, para dar um respiro)
                tickFormatter={(value) => `${value}%`} // Formata os rótulos do eixo Y para incluir '%'
                allowDataOverflow={true} // Permite que a linha ultrapasse um pouco o domínio definido se necessário
              />
              {/* Tooltip (caixa de informações que aparece ao passar o mouse sobre o gráfico) */}
              <Tooltip
                labelFormatter={formatTooltipLabel} // Função para formatar o rótulo principal do tooltip (geralmente o valor do eixo X)
                contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid #475569', borderRadius: '8px' }} // Estilos do contêiner do tooltip
                itemStyle={{ color: '#67e8f9' }} // Estilo dos itens dentro do tooltip
                labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }} // Estilo do rótulo principal do tooltip
                formatter={(value) => [`${typeof value === 'number' ? value.toFixed(0) : '?'}%`, 'Nível']} // Formata o valor exibido para cada série de dados e o nome da série
              />
              {/* Legenda do gráfico */}
              <Legend wrapperStyle={{ paddingTop: '20px' }} itemStyle={{ color: '#cbd5e1' }} />
              {/* Linha do gráfico */}
              <Line
                type="monotone" // Tipo de interpolação da linha (suavizada)
                dataKey="nivel" // Chave dos dados para os valores da linha (eixo Y)
                name="Nível (%)" // Nome da série de dados (usado na legenda e tooltip)
                stroke="#67e8f9" // Cor da linha
                strokeWidth={2} // Espessura da linha
                dot={false} // Não exibe pontos em cada dado da linha (para um visual mais limpo com muitos dados)
                activeDot={{ r: 5, strokeWidth: 1, fill: '#67e8f9', stroke: '#f0f9ff' }} // Estilo do ponto que aparece ao passar o mouse sobre um dado específico
              />
            </LineChart>
          </ResponsiveContainer>
        ) : ( // Se não estiver carregando, não houver erro, e não houver dados
          <div style={{ height: `${alturaGrafico}px` }} className="flex items-center justify-center">
            <p className="text-slate-500">Nenhum dado histórico disponível.</p> {/* Mensagem de "sem dados" */}
          </div>
        )}
      </div>
    </div>
  );
};

// Exporta o componente GraficoHistorico para ser usado em outros lugares da aplicação
export default GraficoHistorico;