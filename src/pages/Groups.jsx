import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { TEAMS, GROUPS } from '../data/teams';
import './Groups.css';

const Groups = () => {
  return (
    <div className="groups-page animate-fade-in">
      <div className="container">
        <div className="page-header text-center">
          <span className="badge badge-group">Tournament Teams</span>
          <h1 className="section-heading">Teams & Groups</h1>
          <p className="section-subheading">21 teams across 4 groups. Top 2 from each group advance to the Quarter-Finals.</p>
        </div>

        <div className="groups-grid">
          {Object.entries(GROUPS).map(([groupName, teamIds]) => (
            <div key={groupName} className="group-card glass">
              <div className="group-header">
                <h2>Group {groupName}</h2>
                <span className="team-count">{teamIds.length} Teams</span>
              </div>
              <ul className="team-list">
                {teamIds.map((teamId) => {
                  const team = TEAMS[teamId];
                  return (
                    <li key={teamId} className="team-item">
                      <Link to={`/team/${teamId}`} className="team-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                        <Shield size={20} style={{ color: team?.color }} />
                        <span className="team-name">{team?.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
