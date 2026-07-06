import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { TEAMS } from '../data/teams';
import { TrendingUp } from 'lucide-react';
import './Standings.css';

const FORM_COLORS = { W: '#00ff88', D: '#f59e0b', L: '#ff0055' };

function FormBadge({ result }) {
  return (
    <span className={`form-badge form-${result.toLowerCase()}`}>{result}</span>
  );
}

function GroupTable({ group, rows }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(false); }
  };

  const sorted = sortCol
    ? [...rows].sort((a, b) => {
        const va = a[sortCol] ?? 0, vb = b[sortCol] ?? 0;
        return sortAsc ? va - vb : vb - va;
      })
    : rows;

  const cols = [
    { key: 'p',   label: 'P'   },
    { key: 'w',   label: 'W'   },
    { key: 'd',   label: 'D'   },
    { key: 'l',   label: 'L'   },
    { key: 'gf',  label: 'GF', hide: 'mobile' },
    { key: 'ga',  label: 'GA', hide: 'mobile' },
    { key: 'gd',  label: 'GD'  },
    { key: 'pts', label: 'Pts' },
  ];

  return (
    <div className="group-table-card glass">
      <div className="group-table-header">
        <h3>Group {group}</h3>
        <span className="team-count">{rows.length} teams</span>
      </div>

      <div className="table-scroll">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="pos-th">#</th>
              <th className="name-th">Team</th>
              <th className="form-th hide-mobile">Form</th>
              {cols.map(c => (
                <th
                  key={c.key}
                  className={`sortable${c.hide ? ` hide-${c.hide}` : ''}${sortCol === c.key ? ' active' : ''}`}
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isQ = i < 2;
              const form = row.form.slice(-5);
              return (
                <tr key={row.team.id} className={isQ ? 'qualifies' : ''}>
                  <td className="pos-td">
                    {isQ
                      ? <span className="pos-qual">{i + 1}</span>
                      : <span className="pos-num">{i + 1}</span>
                    }
                  </td>
                  <td className="name-td">
                    <Link to={`/team/${row.team.id}`} style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <span
                        className="team-dot"
                        style={{ background: TEAMS[row.team.id]?.color }}
                      />
                      <span className="team-full">{row.team.name}</span>
                      <span className="team-short">{row.team.shortName}</span>
                    </Link>
                  </td>
                  <td className="form-td hide-mobile">
                    <div className="form-badges">
                      {form.length === 0
                        ? <span className="no-form">—</span>
                        : form.map((f, fi) => <FormBadge key={fi} result={f} />)
                      }
                    </div>
                  </td>
                  <td>{row.p}</td>
                  <td>{row.w}</td>
                  <td>{row.d}</td>
                  <td>{row.l}</td>
                  <td className="hide-mobile">{row.gf}</td>
                  <td className="hide-mobile">{row.ga}</td>
                  <td className={row.gd > 0 ? 'gd-pos' : row.gd < 0 ? 'gd-neg' : ''}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="pts-td">{row.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-legend">
        <div className="legend-item q"><span className="legend-bar" />Advances to Quarter-Finals</div>
      </div>
    </div>
  );
}

export default function Standings() {
  const { standings } = useTournament();

  return (
    <div className="standings-page animate-fade-in">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-group">Live Tables</span>
          <h1 className="section-heading">Group Standings</h1>
          <p className="section-subheading">
            Auto-calculated from match results. Top 2 teams per group advance to the Quarter-Finals.
            Click column headers to sort.
          </p>
        </div>

        <div className="standings-grid">
          {Object.entries(standings).map(([group, rows]) => (
            <GroupTable key={group} group={group} rows={rows} />
          ))}
        </div>

        {/* Tiebreaker Rules */}
        <div className="tiebreaker-box glass">
          <h3><TrendingUp size={18} /> Tiebreaker Rules</h3>
          <ol>
            <li>Points (Win=3, Draw=1, Loss=0)</li>
            <li>Head-to-head points</li>
            <li>Head-to-head goal difference</li>
            <li>Overall goal difference</li>
            <li>Overall goals scored</li>
            <li>Fair play points (fewer cards)</li>
            <li>Drawing of lots</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
