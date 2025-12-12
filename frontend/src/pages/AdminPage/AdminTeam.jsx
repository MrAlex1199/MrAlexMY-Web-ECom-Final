import React, { useState, useEffect } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import { useRealtimeUsers, notifyDataChange } from "../../utils/realtime";
import {
  Users, Shield, UserCheck, Search, ChevronDown, ChevronUp,
  Mail, Phone, Calendar, X
} from "lucide-react";
import "../../Styles/loader.css";

export default function AdminTeam({ adminData }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState("All Members");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("AToken");
        if (!token) {
          console.error("Admin token not found");
          setTeam([]);
          setLoading(false);
          return;
        }

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        const timestamp = new Date().getTime();

        const response = await fetch(`http://localhost:3001/api/users/admins?_t=${timestamp}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error("Failed to fetch team members");
        
        const data = await response.json();
        // Handle different response formats
        const teamData = data.admins || data || [];
        setTeam(teamData);
      } catch (error) {
        // Handle different types of errors
        if (error.name === 'AbortError') {
          console.log("Request timeout, will retry team fetch");
          setTimeout(() => fetchTeam(), 3000);
        } else if (error.message && error.message.includes('429')) {
          console.log("Rate limited, will retry team fetch later");
          setTimeout(() => {
            if (team.length === 0) {
              fetchTeam();
            }
          }, 7000);
        } else {
          console.error("Error:", error);
        }
        setTeam([]);
      } finally {
        setLoading(false);
      }
    };

  // Real-time updates for team members
  useEffect(() => {
    const unsubscribe = useRealtimeUsers((data, meta) => {
      if (meta.isUpdate) {
        const teamData = data.admins || data || [];
        const currentCount = team.length;
        const newCount = teamData.length;
        
        if (newCount !== currentCount) {
          if (newCount > currentCount) {
            notifyDataChange('team', 'มีสมาชิกทีมใหม่เข้าร่วม!', 'success');
          } else {
            notifyDataChange('team', 'มีสมาชิกทีมถูกลบ', 'warning');
          }
        }
        
        setTeam(teamData);
      }
    }, 30000); // Check every 30 seconds

    return unsubscribe;
  }, [team.length]);

  // Auto-refresh team data every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing team data...");
      fetchTeam();
    }, 60 * 1000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  // คำนวณสถิติ
  const stats = {
    total: team.length,
    masterAdmin: team.filter(m => m.role === "Admin (Owner Master ID)").length,
    sellers: team.filter(m => m.role === "Seller").length,
    managers: team.filter(m => m.role === "Warehouse Manager").length,
    specialists: team.filter(m => m.role.includes("Specialist") || m.role.includes("Analyst") || m.role.includes("Creator")).length,
    support: team.filter(m => m.role.includes("Support") || m.role.includes("Clerk") || m.role.includes("Coordinator") || m.role.includes("Developer")).length,
  };

  // กรองตาม role + ค้นหา
  const filteredTeam = team.filter(member => {
    const matchesRole = filter === "All Members" || 
                       (filter === "Master Admin" && member.role === "Admin (Owner Master ID)") ||
                       (filter === "Seller" && member.role === "Seller") ||
                       (filter === "Manager" && member.role.includes("Manager")) ||
                       (filter === "Specialist" && (member.role.includes("Specialist") || member.role.includes("Analyst") || member.role.includes("Creator"))) ||
                       (filter === "Support" && (member.role.includes("Support") || member.role.includes("Clerk") || member.role.includes("Coordinator") || member.role.includes("Developer")));
    
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.masterID.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredTeam.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const toggleExpand = (id) => setExpandedMember(expandedMember === id ? null : id);

  const getRoleBadge = (role) => {
    if (role === "Admin (Owner Master ID)") return "bg-red-100 text-red-800";
    if (role === "Seller") return "bg-blue-100 text-blue-800";
    if (role.includes("Manager")) return "bg-green-100 text-green-800";
    if (role.includes("Specialist") || role.includes("Analyst")) return "bg-purple-100 text-purple-800";
    if (role.includes("Creator")) return "bg-pink-100 text-pink-800";
    if (role.includes("Support")) return "bg-orange-100 text-orange-800";
    if (role.includes("Developer")) return "bg-indigo-100 text-indigo-800";
    if (role.includes("Clerk") || role.includes("Coordinator")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const getRoleIcon = (role) => {
    if (role === "Admin (Owner Master ID)") return <Shield className="w-4 h-4" />;
    if (role === "Seller" || role.includes("Manager")) return <UserCheck className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Header
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          textpage="ทีมงานผู้ดูแล"
          AdminData={adminData}
        />

        <div className="p-6 space-y-6 mx-auto">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สมาชิกทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Master Admin</p>
                  <p className="text-2xl font-bold text-red-600">{stats.masterAdmin}</p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sellers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sellers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.managers}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Specialists</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.specialists}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Team Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                รายชื่อทีมงาน ({filteredTeam.length})
              </h2>

              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm w-full md:w-64"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
                >
                  <option value="All Members">ทั้งหมด</option>
                  <option value="Master Admin">Master Admin</option>
                  <option value="Seller">Seller</option>
                  <option value="Manager">Manager</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Support">Support</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-3">Master ID</th>
                    <th className="px-6 py-3">ตำแหน่ง</th>
                    <th className="px-6 py-3">อีเมล</th>
                    <th className="px-6 py-3">โทรศัพท์</th>
                    <th className="px-6 py-3 text-center">เข้าร่วมเมื่อ</th>
                    <th className="px-6 py-3 text-center">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-500">
                        กำลังโหลด...
                      </td>
                    </tr>
                  ) : currentMembers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-500">
                        ไม่พบสมาชิก
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((member) => (
                      <React.Fragment key={member._id}>
                        <tr className="bg-white border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                                {member.firstName[0]}{member.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.isActive ? (
                                    <span className="text-green-600">● Active</span>
                                  ) : (
                                    <span className="text-red-600">● Inactive</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                              {member.masterID}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{member.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{member.phoneNumber || "—"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{new Date(member.createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleExpand(member._id)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto"
                            >
                              {expandedMember === member._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {expandedMember === member._id ? 'ซ่อน' : 'แสดง'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedMember === member._id && (
                          <tr>
                            <td colSpan="7" className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">ข้อมูลส่วนตัว</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      <span>Master ID: <span className="font-mono font-bold text-indigo-600">{member.masterID}</span></span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      <span>{member.email}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Phone className="w-4 h-4" />
                                      <span>{member.phoneNumber || "ยังไม่ระบุ"}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className={`w-3 h-3 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      <span>สถานะ: {member.isActive ? "ใช้งานได้" : "ปิดใช้งาน"}</span>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">การเข้าร่วม</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>วันที่เข้าร่วม: {new Date(member.createdAt).toLocaleString('th-TH')}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>อัปเดตล่าสุด: {new Date(member.updatedAt).toLocaleString('th-TH')}</span>
                                    </p>
                                    {member.lastLogin && (
                                      <p className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>เข้าสู่ระบบล่าสุด: {new Date(member.lastLogin).toLocaleString('th-TH')}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">สิทธิ์และหน้าที่</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Shield className="w-4 h-4" />
                                      <span className="font-medium">{member.role}</span>
                                    </p>
                                    {member.permissions && member.permissions.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 mb-1">สิทธิ์การเข้าถึง:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {member.permissions.map((permission, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                              {permission}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {member.createdBy && (
                                      <p className="flex items-center gap-2 text-xs">
                                        <Users className="w-3 h-3" />
                                        <span>สร้างโดย: {member.createdBy}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredTeam.length)} จาก {filteredTeam.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    ก่อนหน้า
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          pageNum === currentPage
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    ถัดไป
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}