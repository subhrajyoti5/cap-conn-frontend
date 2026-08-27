"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useParams } from "next/navigation";
import { getCourse, enrollCourse, publishCourse } from "@/features/courses/api/courses.api";
import { getResource } from "@/features/resources/api/resources.api";
import { UploadResourceModal } from "@/components/upload-resource-modal";
import { AssignmentStudioModal } from "@/components/assignment-studio-modal";
import { EditAssignmentModal } from "@/components/edit-assignment-modal";
import { SubmitDocumentModal } from "@/components/submit-document-modal";
import { GradeSubmissionsModal } from "@/components/grade-submissions-modal";
import { TakeAssessmentModal } from "@/components/take-assessment-modal";
import { ViewSubmissionsModal } from "@/components/view-submissions-modal";
import { apiFetch } from "@/lib/api";
import { getEmbedUrl, isGoogleDriveUrl } from "@/components/google-drive-viewer";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { getToken, userId, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [aiAssignmentOpen, setAiAssignmentOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [viewSubmissionsAssessment, setViewSubmissionsAssessment] = useState(null);
  const [editAssignmentData, setEditAssignmentData] = useState(null);
  const [submitDocAssignmentId, setSubmitDocAssignmentId] = useState(null);
  const [gradeAssessmentId, setGradeAssessmentId] = useState(null);
  const [takeAssessment, setTakeAssessment] = useState(null);
  const [authToken, setAuthToken] = useState("");


  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [loadingTrainer, setLoadingTrainer] = useState(false);


  const [showTraineeModal, setShowTraineeModal] = useState(false);
  const [traineeProfile, setTraineeProfile] = useState(null);
  const [loadingTrainee, setLoadingTrainee] = useState(false);


  const [showInviteTrainerModal, setShowInviteTrainerModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitingTrainer, setInvitingTrainer] = useState(false);


  const [showRemoveTraineeModal, setShowRemoveTraineeModal] = useState(false);
  const [removeTraineeId, setRemoveTraineeId] = useState(null);
  const [removeReason, setRemoveReason] = useState("");
  const [removingTrainee, setRemovingTrainee] = useState(false);


  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseDesc, setEditCourseDesc] = useState("");
  const [updatingCourse, setUpdatingCourse] = useState(false);


  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);


  const [showRejectRequestModal, setShowRejectRequestModal] = useState(false);
  const [rejectTraineeId, setRejectTraineeId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectingRequest, setRejectingRequest] = useState(false);


  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [unenrollStatus, setUnenrollStatus] = useState({ type: "", message: "" });

  const [activeTab, setActiveTab] = useState("classwork");
  const [selectedResource, setSelectedResource] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ type: "", message: "" });
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });
  const [removeStatus, setRemoveStatus] = useState({ type: "", message: "" });
  const [rejectStatus, setRejectStatus] = useState({ type: "", message: "" });

  async function handleViewTrainer(trainerId) {
    const targetId = trainerId || course?.trainerId;
    if (!targetId) return;
    setShowTrainerModal(true);
    setLoadingTrainer(true);
    try {
      const res = await apiFetch(`/profiles/trainers/${targetId}`);
      setTrainerProfile(res.data);
    } catch (e) {
      console.error("Error loading trainer public profile:", e);
    } finally {
      setLoadingTrainer(false);
    }
  }

  const [errorMessage, setErrorMessage] = useState("");

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;
      setAuthToken(token);
      setErrorMessage("");
      const res = await getCourse(token, id);
      if (res?.data) {
        setCourse(res.data);
      } else {
        setErrorMessage("Course details could not be retrieved.");
      }
    } catch (e) {
      console.error("Error loading course details:", e);
      setErrorMessage(e.message || "Failed to load course details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id, getToken]);

  async function handleEnroll() {
    const token = await getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      await enrollCourse(token, id);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    const token = await getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      await publishCourse(token, id);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleViewTrainee(traineeId) {
    setShowTraineeModal(true);
    setLoadingTrainee(true);
    try {
      const res = await apiFetch(`/profiles/trainees/${traineeId}`);
      setTraineeProfile(res.data);
    } catch (e) {
      console.error("Error loading trainee public profile:", e);
    } finally {
      setLoadingTrainee(false);
    }
  }

  async function handleApproveEnrollment(traineeId) {
    setActionMessage("");
    try {
      await apiFetch(`/courses/${id}/enrollments/${traineeId}/approve`, { method: "POST" });
      setActionMessage("Enrollment request approved successfully!");
      setTimeout(() => setActionMessage(""), 4000);
      load();
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to approve enrollment request.");
      setTimeout(() => setActionMessage(""), 4000);
    }
  }

  async function handleRejectEnrollment() {
    if (!rejectTraineeId) return;
    setRejectingRequest(true);
    setRejectStatus({ type: "", message: "" });
    try {
      await apiFetch(`/courses/${id}/enrollments/${rejectTraineeId}/reject`, {
        method: "POST",
        body: JSON.stringify({ message: rejectMessage }),
      });
      setRejectStatus({ type: "success", message: "Enrollment request rejected successfully." });
      setTimeout(() => {
        setShowRejectRequestModal(false);
        setRejectTraineeId(null);
        setRejectMessage("");
        setRejectStatus({ type: "", message: "" });
        load();
      }, 1500);
    } catch (e) {
      console.error(e);
      setRejectStatus({ type: "error", message: "Failed to reject enrollment request." });
    } finally {
      setRejectingRequest(false);
    }
  }

  async function handleRemoveTrainee() {
    if (!removeTraineeId) return;
    setRemovingTrainee(true);
    setRemoveStatus({ type: "", message: "" });
    try {
      await apiFetch(`/courses/${id}/remove-trainee`, {
        method: "POST",
        body: JSON.stringify({ traineeId: removeTraineeId, reason: removeReason }),
      });
      setRemoveStatus({ type: "success", message: "Trainee removed successfully." });
      setTimeout(() => {
        setShowRemoveTraineeModal(false);
        setRemoveTraineeId(null);
        setRemoveReason("");
        setRemoveStatus({ type: "", message: "" });
        load();
      }, 1500);
    } catch (e) {
      console.error(e);
      setRemoveStatus({ type: "error", message: "Failed to remove trainee." });
    } finally {
      setRemovingTrainee(false);
    }
  }

  async function handleInviteTrainer(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInvitingTrainer(true);
    setInviteStatus({ type: "", message: "" });
    try {
      await apiFetch(`/courses/${id}/invite-trainer`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      setInviteStatus({ type: "success", message: "Invitation sent successfully! They can accept it once they log in." });
      setTimeout(() => {
        setShowInviteTrainerModal(false);
        setInviteEmail("");
        setInviteStatus({ type: "", message: "" });
        load();
      }, 2000);
    } catch (e) {
      console.error(e);
      setInviteStatus({ type: "error", message: e.message || "Failed to send invitation. Please verify the email address." });
    } finally {
      setInvitingTrainer(false);
    }
  }

  async function handleUnenroll() {
    setUnenrolling(true);
    setUnenrollStatus({ type: "", message: "" });
    try {
      await apiFetch(`/courses/${id}/enroll`, { method: "DELETE" });
      setUnenrollStatus({ type: "success", message: "You have un-enrolled from this course." });
      setTimeout(() => {
        setShowUnenrollModal(false);
        setUnenrollStatus({ type: "", message: "" });
        load();
      }, 1500);
    } catch (e) {
      console.error(e);
      setUnenrollStatus({ type: "error", message: e.message || "Failed to un-enroll from course." });
    } finally {
      setUnenrolling(false);
    }
  }

  async function handleUpdateCourse(e) {
    e.preventDefault();
    setUpdatingCourse(true);
    setEditStatus({ type: "", message: "" });
    try {
      await apiFetch(`/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editCourseTitle, description: editCourseDesc }),
      });
      setEditStatus({ type: "success", message: "Course details updated successfully!" });
      setTimeout(() => {
        setShowEditCourseModal(false);
        setEditStatus({ type: "", message: "" });
        load();
      }, 1500);
    } catch (e) {
      console.error(e);
      setEditStatus({ type: "error", message: "Failed to update course details." });
    } finally {
      setUpdatingCourse(false);
    }
  }

  async function handleOpenResource(resource) {
    if (!resource) return;
    setSelectedResource(resource);
    setActiveTab("classwork");
    if (!resource.downloadUrl && resource.id && !resource.storageKey?.startsWith("http")) {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await getResource(token, resource.id);
        const url = res.data?.downloadUrl || res.downloadUrl;
        if (url) {
          setSelectedResource((prev) => ({ ...prev, downloadUrl: url }));
        }
      } catch (err) {
        console.error("Failed to fetch download url:", err);
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 w-full bg-muted rounded-2xl" />
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="h-48 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <p className="font-display text-lg text-foreground font-semibold">
          {errorMessage ? "Unable to Load Course" : "Course not found"}
        </p>
        <p className="text-sm text-muted-foreground">
          {errorMessage || "The course you are looking for does not exist or has been removed."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            Retry
          </button>
          <Link href="/courses" className="btn-secondary text-xs py-2 px-4">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const isSecondaryTrainer = course.trainers?.some((t) => t.trainerId === userId);
  const isOwner = course.trainerId === userId || isSecondaryTrainer;
  const myEnrollment = course.enrollments?.find((e) => e.traineeId === userId || e.userId === userId);
  const isEnrolled = myEnrollment?.status === "ACTIVE";
  const isPending = myEnrollment?.status === "PENDING";
  const isRejected = myEnrollment?.status === "REJECTED";
  const isAdmin = user?.role === "ADMIN";
  const hasAccess = isOwner || isEnrolled || isAdmin;


  const streamFeed = [];
  if (course.resources) {
    course.resources.forEach((r) => {
      streamFeed.push({
        id: `res-${r.id}`,
        type: "resource",
        title: `Uploaded new resource: ${r.title}`,
        date: new Date(r.createdAt),
        data: r,
      });
    });
  }
  if (course.assessments) {
    course.assessments.forEach((a) => {
      streamFeed.push({
        id: `asmt-${a.id}`,
        type: "assessment",
        title: `Posted new assessment: ${a.title}`,
        date: a.createdAt ? new Date(a.createdAt) : new Date(course.createdAt),
        data: a,
      });
    });
  }

  streamFeed.sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6 max-w-5xl animate-in stagger-1">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-800 text-white p-8 shadow-lg relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${course.status === "PUBLISHED" ? "bg-white/20 text-white" : "bg-black/20 text-white"} border-transparent uppercase text-[10px]`}>
                {course.status?.toLowerCase()}
              </span>
              {course.subject && (
                <span className="badge bg-white/20 text-white border-transparent text-[10px]">{course.subject.name}</span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{course.title}</h1>
            <p className="text-xs opacity-75 mt-3">Instructor: {course.trainer?.name || "Unassigned"}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(isOwner || isAdmin) && (
              <button
                onClick={() => {
                  setEditCourseTitle(course.title);
                  setEditCourseDesc(course.description);
                  setShowEditCourseModal(true);
                }}
                className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-md text-xs py-1.5 px-3"
              >
                ⚙ Edit Details
              </button>
            )}
            {hasAccess && (
              <button
                onClick={() => setShowCourseDetailsModal(true)}
                className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-md text-xs py-1.5 px-3"
              >
                ℹ View Course Info
              </button>
            )}
            {isOwner && course.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="btn-secondary bg-white text-primary hover:bg-white/90 border-transparent shadow-md text-xs py-1.5 px-3"
              >
                {actionLoading ? "Publishing..." : "Publish Course"}
              </button>
            )}
            {user?.role === "TRAINEE" && course.status === "PUBLISHED" && !isEnrolled && (
              <>
                {isPending ? (
                  <span className="badge bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1.5 text-xs font-semibold">
                    Request Pending
                  </span>
                ) : isRejected ? (
                  <div className="flex items-center gap-2">
                    <span className="badge bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1.5 text-xs font-semibold">
                      Request Rejected
                    </span>
                    <button
                      onClick={handleEnroll}
                      disabled={actionLoading}
                      className="btn-secondary bg-white text-primary hover:bg-white/90 border-transparent shadow-md text-xs py-1.5 px-3"
                    >
                      {actionLoading ? "Enrolling..." : "Retry Enroll"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={actionLoading}
                    className="btn-secondary bg-white text-primary hover:bg-white/90 border-transparent shadow-md text-xs py-1.5 px-3"
                  >
                    {actionLoading ? "Enrolling..." : "Enroll in Course"}
                  </button>
                )}
              </>
            )}
            {isEnrolled && (
              <div className="flex items-center gap-2">
                <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1.5 text-xs font-semibold">
                  ✓ Enrolled
                </span>
                {user?.role === "TRAINEE" && (
                  <button
                    onClick={() => setShowUnenrollModal(true)}
                    className="btn-secondary bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30 shadow-md text-xs py-1.5 px-3"
                  >
                    Un-enroll
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
      </div>

      {actionMessage && (
        <div className="bg-primary/5 border border-primary/10 text-primary text-xs p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="font-bold hover:opacity-80 font-mono text-[10px]">✕</button>
        </div>
      )}

      {!hasAccess && user?.role === "TRAINEE" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card border border-border p-6 bg-card space-y-4">
              <h3 className="font-display font-bold text-base text-foreground">Course Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {course.description || "No description provided for this classroom course."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card border border-border p-5 bg-card flex flex-col justify-between">
                <span className="text-2xl font-bold font-display text-primary">
                  {(course?.resources || []).filter((r) => r.type === "LECTURE").length}
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase mt-1 tracking-wider">
                  Lectures
                </span>
              </div>
              <div className="card border border-border p-5 bg-card flex flex-col justify-between">
                <span className="text-2xl font-bold font-display text-accent">
                  {(course?.resources || []).filter((r) => ["DOCUMENT", "PRESENTATION", "STUDY_MATERIAL"].includes(r.type)).length}
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase mt-1 tracking-wider">
                  Documents
                </span>
              </div>
              <div className="card border border-border p-5 bg-card flex flex-col justify-between">
                <span className="text-2xl font-bold font-display text-emerald-600">
                  {(course?.assessments || []).filter((a) => a.status === "PUBLISHED").length}
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase mt-1 tracking-wider">
                  Assignments
                </span>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-foreground">Ready to start learning?</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Enroll to get access to all lectures, classwork materials, and certificates.</p>
              </div>
              {course.status === "PUBLISHED" && (
                <>
                  {isPending ? (
                    <span className="badge bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-2 text-xs font-semibold shrink-0">
                      Request Pending
                    </span>
                  ) : isRejected ? (
                    <button
                      onClick={handleEnroll}
                      disabled={actionLoading}
                      className="btn-primary py-2 px-5 text-xs font-semibold shrink-0"
                    >
                      {actionLoading ? "Enrolling..." : "Retry Enroll"}
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={actionLoading}
                      className="btn-primary py-2 px-5 text-xs font-semibold shrink-0"
                    >
                      {actionLoading ? "Enrolling..." : "Enroll in Course"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="card border border-border p-6 bg-card space-y-4">
              <h3 className="font-display font-bold text-sm text-foreground">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "T"}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">{course.trainer?.name || "Unassigned Trainer"}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{course.trainer?.email}</p>
                </div>
              </div>
              <button
                onClick={handleViewTrainer}
                className="btn-secondary w-full text-xs py-2 text-center block font-semibold border-border hover:bg-muted/40"
              >
                View Instructor Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>

          <div className="border-b border-border flex items-center gap-6">
            <button
              onClick={() => setActiveTab("stream")}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "stream" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Stream
            </button>
            <button
              onClick={() => setActiveTab("classwork")}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "classwork" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Classwork
            </button>
            <button
              onClick={() => setActiveTab("people")}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors relative flex items-center gap-2 ${activeTab === "people" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <span>People</span>
              {(isOwner || isAdmin) && (course?.enrollments?.filter((e) => e.status === "PENDING") || []).length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" title="Pending enrollment requests" />
              )}
            </button>
          </div>

          <div className="space-y-6">

            {activeTab === "stream" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <div className="md:col-span-1 space-y-4">
                  <div className="card border border-border p-4 bg-card">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Upcoming Due</h3>
                    {course.assessments?.filter(a => a.status === "PUBLISHED").length > 0 ? (
                      <div className="space-y-2">
                        {course.assessments.filter(a => a.status === "PUBLISHED").slice(0, 2).map(a => (
                          <p key={a.id} className="text-xs text-foreground leading-normal">
                            <span className="font-semibold block">{a.title}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {a.deadline ? `Due: ${new Date(a.deadline).toLocaleDateString()}` : "No deadline"}
                            </span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Woohoo, no work due soon!</p>
                    )}
                  </div>
                </div>


                <div className="md:col-span-3 space-y-4">

                  <div className="card border border-border p-5 bg-card">
                    <h3 className="font-semibold text-sm text-foreground mb-1">About this course</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{course.description || "No description provided."}</p>
                  </div>


                  <div className="space-y-4">
                    {streamFeed.length === 0 ? (
                      <div className="text-center py-10 bg-muted/10 border border-dashed border-border rounded-xl">
                        <p className="text-xs text-muted-foreground">Nothing has been posted to the stream yet.</p>
                      </div>
                    ) : (
                      streamFeed.map((post) => (
                        <div key={post.id} className="card border border-border p-5 bg-card flex gap-4">
                          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "I"}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-foreground">{course.trainer?.name || "Instructor"}</span>
                              <span className="text-[10px] text-muted-foreground">{post.date.toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">{post.title}</p>


                            {post.type === "resource" && (
                              <button
                                type="button"
                                onClick={() => handleOpenResource(post.data)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-semibold text-primary hover:bg-muted transition-colors mt-2 cursor-pointer"
                              >
                                <span>📂</span>
                                Open Resource
                              </button>
                            )}

                            {post.type === "assessment" && (
                              <button
                                onClick={() => setActiveTab("classwork")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-semibold text-primary hover:bg-muted transition-colors mt-2"
                              >
                                <span>📝</span>
                                View Assessment
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}


            {activeTab === "classwork" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Resource Directory Left Sidebar */}
                <div className="lg:col-span-4 card border border-border bg-card p-4 space-y-4 rounded-xl sticky top-20">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="icon text-base text-primary" aria-hidden="true">folder</span>
                      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                        Resource Directory
                      </h2>
                    </div>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="btn-secondary btn-sm text-[10px] py-1 px-2 flex items-center gap-1"
                        title="Upload course resource"
                      >
                        <span className="icon text-xs">add</span>
                        Add Content
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Course Intro Accordion */}
                    <div className="border border-border/60 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                        <span>Course Introduction</span>
                        <span className="text-xs text-muted-foreground">−</span>
                      </div>
                      <div className="p-1 space-y-0.5 bg-card">
                        <button
                          onClick={() => setSelectedResource(null)}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                            selectedResource === null
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="icon text-sm text-primary">article</span>
                            <span className="truncate">About the Course</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">Lesson</span>
                        </button>
                        <button
                          onClick={() => setSelectedResource({ isPolicy: true, title: "Grading Policy" })}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                            selectedResource?.title === "Grading Policy"
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="icon text-sm text-primary">gavel</span>
                            <span className="truncate">Grading Policy</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">Lesson</span>
                        </button>
                      </div>
                    </div>

                    {/* Additional Accordion Categories */}
                    {["Disciplinary & Non Academic Conduct", "Malpractice Rules", "Live session recordings"].map((title) => (
                      <div key={title} className="border border-border/60 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                          <span className="truncate">{title}</span>
                          <span className="text-xs text-muted-foreground">+</span>
                        </div>
                      </div>
                    ))}

                    {/* Course Resources Accordion */}
                    <div className="border border-border/60 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                        <span>Course Resources</span>
                        <span className="text-xs text-muted-foreground">−</span>
                      </div>
                      <div className="p-1 space-y-0.5 bg-card">
                        {course.resources && course.resources.length > 0 ? (
                          course.resources.map((res) => {
                            const isSelected = selectedResource?.id === res.id;
                            let iconName = "description";
                            if (res.type === "LECTURE" || res.type === "VIDEO") iconName = "play_circle";
                            if (res.type === "PRESENTATION") iconName = "co_present";

                            return (
                              <button
                                key={res.id}
                                onClick={() => handleOpenResource(res)}
                                className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                  <span className="icon text-sm shrink-0">{iconName}</span>
                                  <span className="truncate">{res.title}</span>
                                </div>
                                <span className="text-[9px] uppercase font-mono text-muted-foreground shrink-0">
                                  {res.type}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic px-3 py-1">No uploaded files yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Navigation Accordion: Assignments & AI Quiz */}
                    <div className="border border-border/60 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                        <span>Navigation</span>
                        <span className="text-xs text-muted-foreground">−</span>
                      </div>
                      <div className="p-1 space-y-0.5 bg-card">
                        {course.assessments && course.assessments.length > 0 ? (
                          course.assessments.map((a) => {
                            const isDoc = a.type === "DOCUMENT";
                            const isSelected = selectedResource?.id === a.id || selectedResource?.id === `asmt-${a.id}`;
                            return (
                              <button
                                key={a.id}
                                onClick={() => setSelectedResource({ ...a, isAssessment: true })}
                                className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                  <span className="icon text-sm shrink-0">
                                    {isDoc ? "assignment" : "quiz"}
                                  </span>
                                  <span className="truncate">{a.title}</span>
                                </div>
                                <span className="text-[9px] uppercase font-mono text-muted-foreground shrink-0">
                                  {isDoc ? "Task" : "Quiz"}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic px-3 py-1">No assignments posted.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Workspace Content Area */}
                <div className="lg:col-span-8 card border border-border bg-card p-6 min-h-[500px] space-y-6 rounded-xl">
                  {selectedResource === null ? (
                    // Default Overview View
                    <div className="space-y-6">
                      <div className="border-b border-border pb-3 flex items-center gap-2">
                        <span className="icon text-primary text-xl">menu_book</span>
                        <div>
                          <h2 className="font-display text-base font-bold text-foreground">About the Course</h2>
                          <p className="text-[11px] text-muted-foreground">Course Introduction</p>
                        </div>
                      </div>

                      <div className="text-center py-4 border-b border-border/40">
                        <h3 className="font-display text-lg font-bold text-foreground">{course.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Subject: {course.subject?.name || "General"}</p>
                      </div>

                      <div className="space-y-3 text-xs text-foreground/90 leading-relaxed">
                        <p><strong>Course ID:</strong> {course.id?.slice(0, 8).toUpperCase()}</p>
                        <p><strong>Course Status:</strong> {course.status}</p>
                        <p><strong>Instructor:</strong> {course.trainer?.name || "Unassigned Trainer"}</p>
                        <p><strong>Instructor Contact:</strong> {course.trainer?.email || "N/A"}</p>
                        
                        <div className="pt-3 border-t border-border/40 space-y-2">
                          <p className="font-semibold text-foreground">Course Overview:</p>
                          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {course.description || "The primary study material for this course is the set of videos, documents, and assignments posted on the course workspace."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : selectedResource?.isAssessment ? (
                    // Selected Assessment View
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-primary font-bold">
                            {selectedResource.type === "DOCUMENT" ? "Assignment Task" : "Quiz Assessment"}
                          </span>
                          <h2 className="font-display text-lg font-bold text-foreground">{selectedResource.title}</h2>
                        </div>
                        {(isOwner || isAdmin) && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedResource.type === "DOCUMENT") {
                                  setEditAssignmentData(selectedResource);
                                } else {
                                  setEditingAssessment(selectedResource);
                                  setAiAssignmentOpen(true);
                                }
                              }}
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              Edit Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const cleanId = String(selectedResource.id).replace("asmt-", "");
                                if (selectedResource.type === "DOCUMENT") {
                                  setGradeAssessmentId(cleanId);
                                } else {
                                  setViewSubmissionsAssessment({ ...selectedResource, id: cleanId });
                                }
                              }}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Submissions
                            </button>
                          </div>
                        )}
                      </div>

                      {selectedResource.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{selectedResource.description}</p>
                      )}

                      <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Max Score: <strong className="text-foreground">{selectedResource.totalMarks}</strong></span>
                          {selectedResource.deadline && (
                            <span>Due: <strong className="text-foreground">{new Date(selectedResource.deadline).toLocaleDateString()}</strong></span>
                          )}
                        </div>

                        {user?.role === "TRAINEE" && isEnrolled && selectedResource.status === "PUBLISHED" && (
                          <div className="pt-2">
                            {selectedResource.type === "DOCUMENT" ? (
                              <button
                                type="button"
                                onClick={() => setSubmitDocAssignmentId(String(selectedResource.id).replace("asmt-", ""))}
                                className="btn-primary w-full text-xs py-2"
                              >
                                Submit Assignment Document
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setTakeAssessment({ id: String(selectedResource.id).replace("asmt-", ""), mode: "take" })}
                                className="btn-primary w-full text-xs py-2"
                              >
                                Start Quiz Assessment
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Selected Resource View (Video / Document)
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-primary font-bold">
                            {selectedResource.type} Resource
                          </span>
                          <h2 className="font-display text-lg font-bold text-foreground">{selectedResource.title}</h2>
                        </div>
                        {selectedResource.downloadUrl && (
                          <a
                            href={selectedResource.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            <span className="icon text-sm">open_in_new</span>
                            External Link
                          </a>
                        )}
                      </div>

                      {/* Embedded Content Player / Viewer */}
                      {selectedResource.downloadUrl && isGoogleDriveUrl(selectedResource.downloadUrl) ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
                          <iframe
                            src={getEmbedUrl(selectedResource.downloadUrl)}
                            className="w-full h-full border-0"
                            allowFullScreen
                            title={selectedResource.title}
                          />
                        </div>
                      ) : selectedResource.downloadUrl && (selectedResource.type === "LECTURE" || selectedResource.type === "VIDEO") ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
                          <video
                            src={selectedResource.downloadUrl}
                            controls
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed border-border rounded-xl text-center space-y-3 bg-muted/10">
                          <span className="icon text-3xl text-muted-foreground">description</span>
                          <p className="text-xs text-muted-foreground">
                            {selectedResource.downloadUrl
                              ? "Document preview ready. Click below to view or download."
                              : "Resource link is available."}
                          </p>
                          {selectedResource.downloadUrl && (
                            <a
                              href={selectedResource.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                            >
                              <span>Open Document</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}


            {activeTab === "people" && (
              <div className="space-y-6">

                {(isOwner || isAdmin) && (
                  <div className="card border border-amber-500/20 p-6 bg-amber-500/5 space-y-4">
                    <h2 className="font-display text-sm font-bold text-amber-600 border-b border-amber-500/10 pb-2 flex justify-between items-center">
                      <span>Pending Enrollment Requests</span>
                      <span className="text-xs bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                        {(course.enrollments?.filter((e) => e.status === "PENDING") || []).length} requests
                      </span>
                    </h2>
                    {(course.enrollments?.filter((e) => e.status === "PENDING") || []).length > 0 ? (
                      <ul className="divide-y divide-amber-500/10">
                        {course.enrollments
                          .filter((e) => e.status === "PENDING")
                          .map((enrollment) => {
                            const student = enrollment.trainee;
                            if (!student) return null;
                            return (
                              <li key={enrollment.id} className="py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-semibold text-xs">
                                    {student.name ? student.name[0].toUpperCase() : student.email[0].toUpperCase()}
                                  </div>
                                  <button
                                    onClick={() => handleViewTrainee(student.id || enrollment.traineeId)}
                                    className="text-left group"
                                  >
                                    <p className="font-medium text-xs text-foreground group-hover:text-primary transition-colors hover:underline">
                                      {student.name || "No profile name"}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground">{student.email}</p>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleApproveEnrollment(student.id || enrollment.traineeId)}
                                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1 px-2.5"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectTraineeId(student.id || enrollment.traineeId);
                                      setShowRejectRequestModal(true);
                                    }}
                                    className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 text-[10px] py-1 px-2.5"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-xs">
                        No pending enrollment requests.
                      </div>
                    )}
                  </div>
                )}


                <div className="card border border-border p-6 bg-card space-y-4">
                  <h2 className="font-display text-sm font-bold text-primary border-b border-border pb-2 flex justify-between items-center">
                    <span>Teachers</span>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => setShowInviteTrainerModal(true)}
                        className="btn-primary text-[10px] py-1 px-2.5"
                      >
                        + Invite Trainer
                      </button>
                    )}
                  </h2>

                  <button
                    onClick={() => handleViewTrainer(course.trainerId)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                      {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "I"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{course.trainer?.name || "Instructor"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{course.trainer?.email} (Primary)</p>
                    </div>
                  </button>

                  {course.trainers?.map((ct) => {
                    const t = ct.trainer;
                    if (!t) return null;
                    return (
                      <button
                        key={ct.id}
                        onClick={() => handleViewTrainer(t.id)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 hover:shadow-sm transition-all group pt-3 border-t border-border/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                          {t.name ? t.name[0].toUpperCase() : "I"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{t.name || "Instructor"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.email} (Secondary)</p>
                        </div>
                      </button>
                    );
                  })}
                </div>


                <div className="card border border-border p-6 bg-card space-y-4">
                  <h2 className="font-display text-sm font-bold text-primary border-b border-border pb-2 flex justify-between items-center">
                    <span>Classmates</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {(course.enrollments?.filter((e) => e.status === "ACTIVE") || []).length} enrolled
                    </span>
                  </h2>
                  {(course.enrollments?.filter((e) => e.status === "ACTIVE") || []).length > 0 ? (
                    <div className="space-y-2">
                      {course.enrollments
                        .filter((e) => e.status === "ACTIVE")
                        .map((enrollment) => {
                          const student = enrollment.trainee;
                          if (!student) return null;
                          return (
                            <div
                              key={enrollment.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 hover:shadow-sm transition-all group"
                            >
                              <button
                                onClick={() => handleViewTrainee(student.id || enrollment.traineeId)}
                                className="flex-1 text-left flex items-center gap-3 min-w-0"
                              >
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                                  {student.name ? student.name[0].toUpperCase() : student.email[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                    {student.name || "No profile name"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">{student.email}</p>
                                </div>
                              </button>
                              {(isOwner || isAdmin) && (
                                <button
                                  onClick={() => {
                                    setRemoveTraineeId(student.id || enrollment.traineeId);
                                    setShowRemoveTraineeModal(true);
                                  }}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors text-xs font-semibold shrink-0"
                                  title="Remove Trainee"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                      No trainees enrolled in this classroom yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}


      <UploadResourceModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        courseId={id}
        token={authToken}
        onResourceUploaded={load}
      />

      <AssignmentStudioModal
        isOpen={aiAssignmentOpen}
        onClose={() => setAiAssignmentOpen(false)}
        courseId={id}
        token={authToken}
        resources={course?.resources || []}
        initialAssessment={editingAssessment}
        onSaved={load}
      />

      <EditAssignmentModal
        isOpen={Boolean(editAssignmentData)}
        onClose={() => setEditAssignmentData(null)}
        assessment={editAssignmentData}
        courseId={id}
        token={authToken}
        onUpdated={load}
      />

      <SubmitDocumentModal
        isOpen={Boolean(submitDocAssignmentId)}
        onClose={() => setSubmitDocAssignmentId(null)}
        assessmentId={submitDocAssignmentId}
        courseId={id}
        token={authToken}
        onSubmitted={load}
      />

      <GradeSubmissionsModal
        isOpen={Boolean(gradeAssessmentId)}
        onClose={() => setGradeAssessmentId(null)}
        assessmentId={gradeAssessmentId}
        token={authToken}
        onGraded={load}
      />

      <TakeAssessmentModal
        isOpen={Boolean(takeAssessment)}
        onClose={() => setTakeAssessment(null)}
        assessmentId={takeAssessment?.id}
        token={authToken}
        mode={takeAssessment?.mode || "take"}
        onSubmitted={load}
      />

      <ViewSubmissionsModal
        isOpen={Boolean(viewSubmissionsAssessment)}
        onClose={() => setViewSubmissionsAssessment(null)}
        assessment={viewSubmissionsAssessment}
        token={authToken}
        onAssessmentUpdated={load}
      />


      {showTrainerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-200">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-elevated flex flex-col p-6 space-y-6 relative">

            <button
              onClick={() => {
                setShowTrainerModal(false);
                setTrainerProfile(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-semibold p-1 hover:bg-muted/40 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {loadingTrainer ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse w-full">
                <div className="w-16 h-16 rounded-full bg-muted" />
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-72 bg-muted rounded" />
              </div>
            ) : trainerProfile ? (
              <div className="space-y-6">
                {trainerProfile.id === "temp-profile-id" && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <span>⚠️ This trainer has not set up their profile yet. Displaying basic registration info.</span>
                  </div>
                )}
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {trainerProfile.fullName ? trainerProfile.fullName[0].toUpperCase() : "T"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-foreground">{trainerProfile.fullName || "Trainer"}</h3>
                    <p className="text-xs text-muted-foreground">{trainerProfile.phone || "No phone contact"}</p>
                  </div>
                </div>

                {trainerProfile.bio && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Biography</h4>
                    <p className="text-xs text-foreground leading-relaxed italic bg-muted/20 border border-border/40 p-3 rounded-lg">
                      &ldquo;{trainerProfile.bio}&rdquo;
                    </p>
                  </div>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Qualifications</h4>
                    {trainerProfile.qualifications?.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {trainerProfile.qualifications.map((q) => (
                          <li key={q.id} className="p-2 rounded bg-muted/30 border border-border/40">
                            <span className="font-semibold block text-foreground">{q.degree}</span>
                            <span className="text-[10px] text-muted-foreground">{q.institution} ({q.year})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No qualifications declared.</p>
                    )}
                  </div>


                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Experience</h4>
                    {trainerProfile.workExperiences?.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {trainerProfile.workExperiences.map((w) => (
                          <li key={w.id} className="p-2 rounded bg-muted/30 border border-border/40">
                            <span className="font-semibold block text-foreground">{w.role}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {w.organization} ({new Date(w.startDate).toLocaleDateString()} –{" "}
                              {w.endDate ? new Date(w.endDate).toLocaleDateString() : "Present"})
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No work experience declared.</p>
                    )}
                  </div>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {trainerProfile.skills?.length > 0 ? (
                        trainerProfile.skills.map((s) => (
                          <span key={s.id} className="badge bg-muted/60 border border-border text-[9px] py-0.5 px-2">
                            {s.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No skills declared.</p>
                      )}
                    </div>
                  </div>


                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Competencies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {trainerProfile.trainerCompetencies?.length > 0 ? (
                        trainerProfile.trainerCompetencies.map((tc) => (
                          <span key={tc.id} className="badge bg-primary/10 border border-primary/20 text-primary text-[9px] py-0.5 px-2">
                            {tc.competency?.name || "Competency"}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No competencies declared.</p>
                      )}
                    </div>
                  </div>
                </div>


                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Courses Taught</h4>
                  {trainerProfile.courses?.length > 0 ? (
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-muted">
                      {trainerProfile.courses.map((c) => (
                        <Link
                          key={c.id}
                          href={`/courses/${c.id}`}
                          onClick={() => {
                            setShowTrainerModal(false);
                            setTrainerProfile(null);
                          }}
                          className="p-3 bg-muted/10 hover:bg-muted/30 border border-border rounded-xl flex flex-col justify-between hover:border-primary/40 transition-all text-xs min-w-[200px] shrink-0 text-left"
                        >
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-primary font-semibold font-mono">
                              {c.subject?.name || "LMS Subject"}
                            </span>
                            <span className="font-semibold block text-foreground mt-0.5 line-clamp-1">{c.title}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-2">
                            {c.enrollments?.length || 0} enrolled
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No published courses taught.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Could not load trainer profile.</p>
            )}
          </div>
        </div>
      )}

      {showTraineeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground">Trainee Profile Overview</h3>
              <button
                onClick={() => {
                  setShowTraineeModal(false);
                  setTraineeProfile(null);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingTrainee ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground">Loading trainee profile...</p>
                </div>
              ) : traineeProfile ? (
                <div className="space-y-6">
                  {traineeProfile.id === "temp-profile-id" && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                      <span>⚠️ This trainee has not set up their profile yet. Displaying basic registration info.</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-xl border border-border/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                      {traineeProfile.fullName ? traineeProfile.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold font-display text-foreground truncate">{traineeProfile.fullName || "Trainee"}</h3>
                        <span className="badge bg-muted text-muted-foreground text-[9px]">Trainee</span>
                      </div>
                      <p className="text-xs text-foreground font-medium truncate">{traineeProfile.email || "No email available"}</p>
                      {traineeProfile.phone && <p className="text-xs text-muted-foreground mt-0.5">{traineeProfile.phone}</p>}
                    </div>
                  </div>
                  {traineeProfile.bio && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Biography</h4>
                      <p className="text-xs text-foreground leading-relaxed italic bg-muted/20 border border-border/40 p-3 rounded-lg">
                        &ldquo;{traineeProfile.bio}&rdquo;
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Qualifications</h4>
                      {traineeProfile.qualifications?.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {traineeProfile.qualifications.map((q) => (
                            <li key={q.id} className="p-2 rounded bg-muted/30 border border-border/40">
                              <span className="font-semibold block text-foreground">{q.degree}</span>
                              <span className="text-[10px] text-muted-foreground">{q.institution} ({q.year})</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">No qualifications declared.</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Experience</h4>
                      {traineeProfile.workExperiences?.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {traineeProfile.workExperiences.map((w) => (
                            <li key={w.id} className="p-2 rounded bg-muted/30 border border-border/40">
                              <span className="font-semibold block text-foreground">{w.role}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {w.organization} ({new Date(w.startDate).toLocaleDateString()} –{" "}
                                {w.endDate ? new Date(w.endDate).toLocaleDateString() : "Present"})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">No work experience declared.</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {traineeProfile.skills?.length > 0 ? (
                          traineeProfile.skills.map((s) => (
                            <span key={s.id} className="badge bg-muted/60 border border-border text-[9px] py-0.5 px-2">
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No skills declared.</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interests</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {traineeProfile.interests?.length > 0 ? (
                          traineeProfile.interests.map((i) => (
                            <span key={i.id} className="badge bg-primary/10 border border-primary/20 text-primary text-[9px] py-0.5 px-2">
                              {i.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No interests declared.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enrolled Courses</h4>
                    {traineeProfile.courses?.length > 0 ? (
                      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-muted">
                        {traineeProfile.courses.map((c) => (
                          <Link
                            key={c.id}
                            href={`/courses/${c.id}`}
                            onClick={() => {
                              setShowTraineeModal(false);
                              setTraineeProfile(null);
                            }}
                            className="p-3 bg-muted/10 hover:bg-muted/30 border border-border rounded-xl flex flex-col justify-between hover:border-primary/40 transition-all text-xs min-w-[200px] shrink-0 text-left"
                          >
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-primary font-semibold font-mono">
                                {c.subject?.name || "LMS Subject"}
                              </span>
                              <span className="font-semibold block text-foreground mt-0.5 line-clamp-1">{c.title}</span>
                              {c.trainer && (
                                <span className="text-[10px] text-muted-foreground block mt-0.5">
                                  Instructor: {c.trainer.name || c.trainer.email}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No active course enrollments.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">This trainee has not set up their profile details yet.</p>
              )}
            </div>
          </div>
        </div>
      )}




      {showInviteTrainerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground">Invite Co-Trainer</h3>
              <button
                onClick={() => {
                  setShowInviteTrainerModal(false);
                  setInviteEmail("");
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInviteTrainer} className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-normal">
                Enter the email address of the trainer you want to invite as a co-instructor for this course. They will receive a notification to join.
              </p>
              {inviteStatus.message && (
                <div className={`p-3 rounded-xl text-xs border ${inviteStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                  {inviteStatus.message}
                </div>
              )}
              <div className="flex flex-col gap-1 text-left w-full">
                <label htmlFor="inviteEmail" className="label text-xs font-semibold">Trainer Email</label>
                <input
                  id="inviteEmail"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="trainer@example.com"
                  className="input text-xs w-full py-2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteTrainerModal(false);
                    setInviteEmail("");
                  }}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invitingTrainer}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  {invitingTrainer ? "Sending Invitation..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      {showRemoveTraineeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground text-red-600">Remove Trainee</h3>
              <button
                onClick={() => {
                  setShowRemoveTraineeModal(false);
                  setRemoveTraineeId(null);
                  setRemoveReason("");
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-muted-foreground leading-normal">
                Are you sure you want to remove this trainee from the classroom? They will lose access to all resources and assessments.
              </p>
              {removeStatus.message && (
                <div className={`p-3 rounded-xl text-xs border ${removeStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                  {removeStatus.message}
                </div>
              )}
              <div className="flex flex-col gap-1 text-left w-full">
                <label htmlFor="removeReason" className="label text-xs font-semibold">Reason for Removal</label>
                <textarea
                  id="removeReason"
                  required
                  rows={3}
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="Please specify a reason. They will be notified of this reason."
                  className="input text-xs w-full py-2 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveTraineeModal(false);
                    setRemoveTraineeId(null);
                    setRemoveReason("");
                  }}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveTrainee}
                  disabled={removingTrainee || !removeReason.trim()}
                  className="btn-primary bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-4"
                >
                  {removingTrainee ? "Removing..." : "Remove Trainee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}




      {showUnenrollModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground text-red-600">Un-enroll from Course</h3>
              <button
                onClick={() => setShowUnenrollModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-muted-foreground leading-normal">
                Are you sure you want to un-enroll (drop) from this course? You will lose access to classroom resources, and course instructors will be notified.
              </p>
              {unenrollStatus.message && (
                <div className={`p-3 rounded-xl text-xs border ${unenrollStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                  {unenrollStatus.message}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnenrollModal(false)}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnenroll}
                  disabled={unenrolling}
                  className="btn-primary bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-4"
                >
                  {unenrolling ? "Un-enrolling..." : "Confirm Un-enroll"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground">Reject Enrollment Request</h3>
              <button
                onClick={() => {
                  setShowRejectRequestModal(false);
                  setRejectTraineeId(null);
                  setRejectMessage("");
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-muted-foreground leading-normal">
                Please enter a message explaining the reason for rejecting this enrollment request. The trainee will see this reason in notifications.
              </p>
              {rejectStatus.message && (
                <div className={`p-3 rounded-xl text-xs border ${rejectStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                  {rejectStatus.message}
                </div>
              )}
              <div className="flex flex-col gap-1 text-left w-full">
                <label htmlFor="rejectMessage" className="label text-xs font-semibold">Reason Message</label>
                <textarea
                  id="rejectMessage"
                  required
                  rows={3}
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  placeholder="Write reason for rejection..."
                  className="input text-xs w-full py-2 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectRequestModal(false);
                    setRejectTraineeId(null);
                    setRejectMessage("");
                  }}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectEnrollment}
                  disabled={rejectingRequest || !rejectMessage.trim()}
                  className="btn-primary bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-4"
                >
                  {rejectingRequest ? "Rejecting..." : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showEditCourseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground">Update Course Details</h3>
              <button
                onClick={() => {
                  setShowEditCourseModal(false);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
              {editStatus.message && (
                <div className={`p-3 rounded-xl text-xs border ${editStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                  {editStatus.message}
                </div>
              )}
              <div className="flex flex-col gap-1 text-left w-full">
                <label htmlFor="courseTitle" className="label text-xs font-semibold">Course Title</label>
                <input
                  id="courseTitle"
                  type="text"
                  required
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="input text-xs w-full py-2"
                />
              </div>
              <div className="flex flex-col gap-1 text-left w-full">
                <label htmlFor="courseDesc" className="label text-xs font-semibold">Description</label>
                <textarea
                  id="courseDesc"
                  required
                  rows={4}
                  value={editCourseDesc}
                  onChange={(e) => setEditCourseDesc(e.target.value)}
                  className="input text-xs w-full py-2 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCourseModal(false)}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingCourse}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  {updatingCourse ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {showCourseDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground">Course Details</h3>
              <button
                onClick={() => setShowCourseDetailsModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-primary font-mono tracking-wider">
                  {course.subject?.name || "LMS Classroom"}
                </span>
                <h4 className="text-base font-bold text-foreground font-display">{course.title}</h4>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h5>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {course.description || "No description available."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-b border-border py-4">
                <div className="text-center">
                  <span className="block text-lg font-bold text-foreground">
                    {(course.resources || []).filter((r) => r.type === "LECTURE").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Lectures</span>
                </div>
                <div className="text-center border-l border-r border-border">
                  <span className="block text-lg font-bold text-foreground">
                    {(course.resources || []).filter((r) => ["DOCUMENT", "PRESENTATION", "STUDY_MATERIAL"].includes(r.type)).length}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Documents</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-foreground">
                    {(course.assessments || []).filter((a) => a.status === "PUBLISHED").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Assignments</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lead Trainer</h5>
                <button
                  onClick={() => {
                    setShowCourseDetailsModal(false);
                    handleViewTrainer(course.trainerId);
                  }}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
                    {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "T"}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{course.trainer?.name || "Unassigned"}</p>
                    <p className="text-[10px] text-muted-foreground">{course.trainer?.email}</p>
                  </div>
                </button>
              </div>

              {course.trainers?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Co-Trainers</h5>
                  <div className="space-y-2">
                    {course.trainers.map((ct) => {
                      const t = ct.trainer;
                      if (!t) return null;
                      return (
                        <button
                          key={ct.id}
                          onClick={() => {
                            setShowCourseDetailsModal(false);
                            handleViewTrainer(t.id);
                          }}
                          className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 hover:shadow-sm transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
                            {t.name ? t.name[0].toUpperCase() : "T"}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{t.name || "Co-Trainer"}</p>
                            <p className="text-[10px] text-muted-foreground">{t.email}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}