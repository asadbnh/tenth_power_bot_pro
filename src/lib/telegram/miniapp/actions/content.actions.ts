"use server";

/**
 * Server Actions: Services, Projects, Articles, Ads & FAQs
 */

import { requireAdminSession, recordAuditAction } from "../auth/guard";
import {
  getAdminServices,
  getServiceDetails,
  upsertService,
  deleteService,
  toggleServiceProperty,
  addServiceImage,
  deleteServiceImage,
} from "../services/services.service";
import {
  getAdminProjects,
  getProjectDetails,
  upsertProject,
  deleteProject,
  toggleProjectProperty,
  addProjectImage,
  deleteProjectImage,
  addProjectVideo,
  deleteProjectVideo,
  addProjectBeforeAfter,
  deleteProjectBeforeAfter,
} from "../services/projects.service";
import {
  getAdminArticles,
  getArticleDetails,
  upsertArticle,
  deleteArticle,
  toggleArticlePublish,
  generateAiArticle,
  getAdminAds,
  upsertAdvertisement,
  deleteAdvertisement,
  toggleAdvertisementActive,
  getAdminFaqs,
  upsertFaq,
  deleteFaq,
} from "../services/content.service";
import type { ApiResponse, ServiceEntity, ProjectEntity } from "../types";

// ─── 1. Services Actions ──────────────────────────────────────────────

export async function getServicesAction(): Promise<ApiResponse<ServiceEntity[]>> {
  await requireAdminSession();
  const data = await getAdminServices();
  return { success: true, data };
}

export async function getServiceDetailsAction(id: string): Promise<ApiResponse<any>> {
  await requireAdminSession();
  const data = await getServiceDetails(id);
  return { success: true, data };
}

export async function upsertServiceAction(serviceData: Partial<ServiceEntity> & { id?: string }): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await upsertService(serviceData);

  if (res.success && res.id) {
    await recordAuditAction({
      action: serviceData.id ? "update_service" : "create_service",
      entityType: "services",
      entityId: res.id,
      newValues: { name: serviceData.name_ar, price: serviceData.price_from },
    });
  }

  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteServiceAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteService(id);
  if (res.success) {
    await recordAuditAction({
      action: "delete_service",
      entityType: "services",
      entityId: id,
    });
  }
  return { success: res.success, error: res.error };
}

export async function toggleServiceAction(id: string, property: "is_active" | "is_featured"): Promise<ApiResponse<{ value: boolean }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await toggleServiceProperty(id, property);
  return { success: res.success, data: { value: Boolean(res.value) }, error: res.error };
}

export async function addServiceImageAction(serviceId: string, mediaId: string, isCover = false): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await addServiceImage(serviceId, mediaId, isCover);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteServiceImageAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await deleteServiceImage(id);
  return { success: res.success, error: res.error };
}

// ─── 2. Projects Actions ──────────────────────────────────────────────

export async function getProjectsAction(): Promise<ApiResponse<ProjectEntity[]>> {
  await requireAdminSession();
  const data = await getAdminProjects();
  return { success: true, data };
}

export async function getProjectDetailsAction(id: string): Promise<ApiResponse<any>> {
  await requireAdminSession();
  const data = await getProjectDetails(id);
  return { success: true, data };
}

export async function upsertProjectAction(projectData: Partial<ProjectEntity> & { id?: string }): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await upsertProject(projectData);

  if (res.success && res.id) {
    await recordAuditAction({
      action: projectData.id ? "update_project" : "create_project",
      entityType: "projects",
      entityId: res.id,
      newValues: { title: projectData.title_ar, city: projectData.city },
    });
  }

  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteProjectAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteProject(id);
  if (res.success) {
    await recordAuditAction({
      action: "delete_project",
      entityType: "projects",
      entityId: id,
    });
  }
  return { success: res.success, error: res.error };
}

export async function toggleProjectAction(id: string, property: "is_active" | "is_featured"): Promise<ApiResponse<{ value: boolean }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await toggleProjectProperty(id, property);
  return { success: res.success, data: { value: Boolean(res.value) }, error: res.error };
}

export async function addProjectImageAction(projectId: string, mediaId: string, isCover = false): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await addProjectImage(projectId, mediaId, isCover);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteProjectImageAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await deleteProjectImage(id);
  return { success: res.success, error: res.error };
}

export async function addProjectVideoAction(projectId: string, videoUrl: string, titleAr?: string): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await addProjectVideo(projectId, videoUrl, titleAr);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteProjectVideoAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await deleteProjectVideo(id);
  return { success: res.success, error: res.error };
}

export async function addProjectBeforeAfterAction(params: {
  projectId: string;
  beforeImageId: string;
  afterImageId: string;
  captionAr?: string;
}): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await addProjectBeforeAfter(params);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteProjectBeforeAfterAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await deleteProjectBeforeAfter(id);
  return { success: res.success, error: res.error };
}

// ─── 3. Articles Actions ──────────────────────────────────────────────

export async function getArticlesAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getAdminArticles();
  return { success: true, data };
}

export async function getArticleDetailsAction(id: string): Promise<ApiResponse<any>> {
  await requireAdminSession();
  const data = await getArticleDetails(id);
  return { success: true, data };
}

export async function upsertArticleAction(data: any): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await upsertArticle(data);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteArticleAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteArticle(id);
  return { success: res.success, error: res.error };
}

export async function toggleArticlePublishAction(id: string): Promise<ApiResponse<{ status: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await toggleArticlePublish(id);
  return { success: res.success, data: { status: res.status || "draft" }, error: res.error };
}

export async function generateAiArticleAction(topic: string): Promise<ApiResponse<any>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await generateAiArticle(topic);
  return { success: res.success, data: res.data, error: res.error };
}

// ─── 4. Advertisements Actions ────────────────────────────────────────

export async function getAdsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getAdminAds();
  return { success: true, data };
}

export async function upsertAdAction(data: any): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await upsertAdvertisement(data);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteAdAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteAdvertisement(id);
  return { success: res.success, error: res.error };
}

export async function toggleAdActiveAction(id: string): Promise<ApiResponse<{ is_active: boolean }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await toggleAdvertisementActive(id);
  return { success: res.success, data: { is_active: Boolean(res.is_active) }, error: res.error };
}

// ─── 5. FAQs Actions ──────────────────────────────────────────────────

export async function getFaqsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getAdminFaqs();
  return { success: true, data };
}

export async function upsertFaqAction(data: any): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await upsertFaq(data);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteFaqAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteFaq(id);
  return { success: res.success, error: res.error };
}
