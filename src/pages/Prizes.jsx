import React from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { Coins, Info } from 'lucide-react';
import './Prizes.css';

const WIN_PRIZE = 200000;
const DRAW_PRIZE = 100000;

export default function Prizes() {
  const { standings } = useTournament();

  // Flatten all teams from all groups and calculate prizes
  const teamsWithPrizes = Object.values(standings)
    .flat()
    .map(row => {
      const prizeMoney = (row.w * WIN_PRIZE) + (row.d * DRAW_PRIZE);
      return {
        ...row,
        prizeMoney
      };
    })
    // Sort by prize money desc, then pts desc, then gd desc
    .sort((a, b) => {
      if (b.prizeMoney !== a.prizeMoney) return b.prizeMoney - a.prizeMoney;
      if (b.pts !== a.pts) return b.pts - a.pts;
      return b.gd - a.gd;
    });

  const totalPrizeMoney = teamsWithPrizes.reduce((sum, team) => sum + team.prizeMoney, 0);

  return (
    <div className="prizes-page animate-fade-in">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-group" style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37', border: '1px solid #d4af37' }}>
            Money Table
          </span>
          <h1 className="section-heading">Prize Standings</h1>
          <p className="section-subheading">
            Teams earn cash for every result in the group stages. See who's climbing the money log!
          </p>
        </div>

        <div className="prize-table-card glass">
          <div className="prize-table-header">
            <h3><Coins size={20} /> Group Stage Earnings</h3>
            <span className="prize-total">
              Total Distributed: <span style={{ color: '#00ff88' }}>UGX {totalPrizeMoney.toLocaleString()}</span>
            </span>
          </div>

          <div className="table-scroll">
            <table className="prize-table">
              <thead>
                <tr>
                  <th className="rank-td">#</th>
                  <th>Team</th>
                  <th className="hide-mobile">Wins (200k)</th>
                  <th className="hide-mobile">Draws (100k)</th>
                  <th style={{ textAlign: 'right' }}>Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {teamsWithPrizes.map((row, index) => (
                  <tr key={row.team.id}>
                    <td className={`rank-td ${index < 3 ? 'rank-top' : ''}`}>
                      {index + 1}
                    </td>
                    <td>
                      <Link to={`/team/${row.team.id}`} style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <span
                          className="team-dot"
                          style={{ background: TEAMS[row.team.id]?.color }}
                        />
                        <span className="team-full">{row.team.name}</span>
                        <span className="team-short hide-desktop">{row.team.shortName}</span>
                      </Link>
                    </td>
                    <td className="hide-mobile">{row.w}</td>
                    <td className="hide-mobile">{row.d}</td>
                    <td className="money-td">
                      UGX {row.prizeMoney.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="prize-rules glass">
          <h3><Info size={18} /> Prize Money Structure</h3>
          <ul>
            <li>
              <span>Group Stage Win</span>
              <span className="rule-value">UGX 200,000</span>
            </li>
            <li>
              <span>Group Stage Draw</span>
              <span className="rule-value">UGX 100,000</span>
            </li>
            <li>
              <span>Group Stage Loss</span>
              <span className="rule-value" style={{color: 'var(--text-secondary)'}}>UGX 0</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
