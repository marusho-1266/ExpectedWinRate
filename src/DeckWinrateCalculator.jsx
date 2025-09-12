import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

const DeckWinrateCalculator = () => {
  const [matchups, setMatchups] = useState([{
    id: 1,
    deckName: '',
    usageRate: '',
    advantage: '50'
  }]);

  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [actualBattles, setActualBattles] = useState('');
  const [actualWins, setActualWins] = useState('');
  const [customBattles, setCustomBattles] = useState('');

  const advantageOptions = [
    { value: '80', label: '大有利（80%）' },
    { value: '70', label: '有利（70%）' },
    { value: '60', label: 'やや有利（60%）' },
    { value: '50', label: '互角（50%）' },
    { value: '40', label: 'やや不利（40%）' },
    { value: '30', label: '不利（30%）' },
    { value: '20', label: '大不利（20%）' }
  ];

  const addMatchup = () => {
    const newId = Math.max(...matchups.map(m => m.id)) + 1;
    setMatchups([...matchups, {
      id: newId,
      deckName: '',
      usageRate: '',
      advantage: '50'
    }]);
  };

  const removeMatchup = (id) => {
    if (matchups.length > 1) {
      setMatchups(matchups.filter(m => m.id !== id));
    }
  };

  const updateMatchup = (id, field, value) => {
    setMatchups(matchups.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const calculateExpectedWinrate = () => {
    const validMatchups = matchups.filter(m => m.deckName.trim() && m.usageRate);
    
    if (validMatchups.length === 0) {
      alert('少なくとも1つのデッキを入力してください。');
      return;
    }

    const totalUsageRate = validMatchups.reduce((sum, m) => sum + parseFloat(m.usageRate || 0), 0);
    
    // 未知デッキの計算
    const unknownRate = Math.max(0, 100 - totalUsageRate);
    const allMatchups = [...validMatchups];
    
    if (unknownRate > 0) {
      allMatchups.push({
        deckName: '未知デッキ',
        usageRate: unknownRate,
        advantage: '50'
      });
    }

    // 期待勝率の計算
    let expectedWinrate = 0;
    allMatchups.forEach(matchup => {
      const rate = parseFloat(matchup.usageRate) / 100;
      const winrate = parseFloat(matchup.advantage) / 100;
      expectedWinrate += rate * winrate;
    });

    // 各戦数での期待勝利数計算（1-10戦）
    const battleResults = [];
    for (let battles = 1; battles <= 10; battles++) {
      const expectedWins = battles * expectedWinrate;
      battleResults.push({
        battles,
        expectedWins: expectedWins.toFixed(2),
        rounded: Math.round(expectedWins)
      });
    }

    // カスタム戦数での期待勝利数計算
    let customBattleResult = null;
    if (customBattles) {
      const battles = parseFloat(customBattles);
      if (battles > 0) {
        const expectedWins = battles * expectedWinrate;
        customBattleResult = {
          battles,
          expectedWins: expectedWins.toFixed(2),
          rounded: Math.round(expectedWins)
        };
      }
    }

    // 実際の勝率計算
    let actualWinrate = null;
    if (actualBattles && actualWins) {
      const battles = parseFloat(actualBattles);
      const wins = parseFloat(actualWins);
      if (battles > 0 && wins >= 0 && wins <= battles) {
        actualWinrate = (wins / battles * 100).toFixed(2);
      }
    }

    setResults({
      expectedWinrate: (expectedWinrate * 100).toFixed(2),
      matchups: allMatchups,
      battleResults,
      customBattleResult,
      unknownRate,
      actualWinrate,
      actualBattles: actualBattles || null,
      actualWins: actualWins || null
    });
    setShowResults(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-blue-800">
        デッキ勝率計算機
      </h1>

      <div className="bg-gray-50 p-3 sm:p-6 rounded-lg mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">デッキマッチアップ設定</h2>
        
        <div className="space-y-3 sm:space-y-4">
          {matchups.map((matchup, index) => (
            <div key={matchup.id} className="bg-white p-3 sm:p-4 rounded border">
              {/* モバイル: 縦並び、デスクトップ: 横並び */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    デッキ名
                  </label>
                  <input
                    type="text"
                    value={matchup.deckName}
                    onChange={(e) => updateMatchup(matchup.id, 'deckName', e.target.value)}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="デッキ名を入力"
                  />
                </div>
                
                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    使用率 (%)
                  </label>
                  <input
                    type="number"
                    value={matchup.usageRate}
                    onChange={(e) => updateMatchup(matchup.id, 'usageRate', e.target.value)}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="w-full sm:w-40">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    有利不利
                  </label>
                  <select
                    value={matchup.advantage}
                    onChange={(e) => updateMatchup(matchup.id, 'advantage', e.target.value)}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    {advantageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => removeMatchup(matchup.id)}
                  disabled={matchups.length === 1}
                  className={`p-3 sm:p-2 rounded-md min-h-[48px] sm:min-h-0 ${
                    matchups.length === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300'
                  }`}
                >
                  <Trash2 size={20} className="mx-auto sm:mx-0" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 実際の戦績入力 */}
        <div className="bg-white p-3 sm:p-4 rounded border mb-4">
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">実際の戦績（任意）</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                戦数
              </label>
              <input
                type="number"
                value={actualBattles}
                onChange={(e) => setActualBattles(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="例: 10"
                min="1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                勝利数
              </label>
              <input
                type="number"
                value={actualWins}
                onChange={(e) => setActualWins(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="例: 7"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <button
            onClick={addMatchup}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 text-base font-medium min-h-[48px]"
          >
            <Plus size={20} />
            デッキマッチアップ追加
          </button>
          
          <button
            onClick={calculateExpectedWinrate}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 text-base font-medium min-h-[48px]"
          >
            <Calculator size={20} />
            計算
          </button>
        </div>
      </div>

      {showResults && results && (
        <div className="bg-blue-50 p-3 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-800">計算結果</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">勝率比較</h3>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">期待勝率</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {results.expectedWinrate}%
                </div>
              </div>

              {results.actualWinrate && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">実際の勝率</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {results.actualWinrate}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {results.actualWins}勝 / {results.actualBattles}戦
                  </div>
                </div>
              )}

              {results.actualWinrate && (
                <div className="mb-4 p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">差</div>
                  <div className={`text-lg font-bold ${
                    parseFloat(results.actualWinrate) > parseFloat(results.expectedWinrate) 
                      ? 'text-green-600' 
                      : parseFloat(results.actualWinrate) < parseFloat(results.expectedWinrate)
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {parseFloat(results.actualWinrate) > parseFloat(results.expectedWinrate) ? '+' : ''}
                    {(parseFloat(results.actualWinrate) - parseFloat(results.expectedWinrate)).toFixed(2)}%
                  </div>
                </div>
              )}
              
              <h4 className="font-semibold mb-2 text-gray-700 text-sm sm:text-base">マッチアップ</h4>
              <div className="space-y-1 text-xs sm:text-sm">
                {results.matchups.map((matchup, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="truncate pr-2">{matchup.deckName}</span>
                    <span className="text-right whitespace-nowrap">
                      {parseFloat(matchup.usageRate).toFixed(1)}% ({matchup.advantage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">戦数別期待勝利数</h3>
              
              {/* カスタム戦数入力 */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任意の戦数で期待勝利数を計算
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customBattles}
                    onChange={(e) => setCustomBattles(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="戦数を入力"
                    min="1"
                  />
                  <button
                    onClick={calculateExpectedWinrate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 text-sm font-medium"
                  >
                    再計算
                  </button>
                </div>
              </div>

              {/* カスタム戦数の結果表示 */}
              {results.customBattleResult && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700 mb-1">カスタム戦数での期待値</div>
                  <div className="text-xl font-bold text-blue-600">
                    {results.customBattleResult.battles}戦 → {results.customBattleResult.rounded}勝
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    期待値: {results.customBattleResult.expectedWins}勝
                  </div>
                </div>
              )}

              {/* 1-10戦の期待勝利数 */}
              <div className="space-y-1 sm:space-y-2">
                <div className="text-sm text-gray-600 mb-2">1-10戦の期待勝利数</div>
                {results.battleResults.slice(0, 8).map((result) => (
                  <div key={result.battles} className="flex justify-between items-center py-2 sm:py-1 border-b border-gray-100">
                    <span className="font-medium text-sm sm:text-base">{result.battles}戦</span>
                    <div className="text-right">
                      <span className="text-blue-600 font-bold text-sm sm:text-base">{result.rounded}勝</span>
                      <span className="text-gray-500 text-xs sm:text-sm ml-1 sm:ml-2">({result.expectedWins})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {results.unknownRate > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
              <p className="text-yellow-800 text-xs sm:text-sm leading-relaxed">
                <strong>注意:</strong> 入力された使用率の合計が100%に達しないため、
                残り{results.unknownRate.toFixed(1)}%を「未知デッキ」（互角）として計算に含めています。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeckWinrateCalculator;