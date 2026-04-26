package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Report;
import com.project.anonymousplatform.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public Report createReport(Report report) {
        if (report.getTargetType() == null || report.getTargetType().trim().isEmpty()) {
            throw new IllegalArgumentException("Report target type is required");
        }
        if (report.getTargetId() == null) {
            throw new IllegalArgumentException("Report target ID is required");
        }
        if (report.getReason() == null || report.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Report reason is required");
        }
        if (report.getReportedBy() == null || report.getReportedBy().trim().isEmpty()) {
            throw new IllegalArgumentException("Reporter identity is required");
        }
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByStatus("PENDING");
    }

    public void dismissReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + id));
        report.setStatus("RESOLVED");
        reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new IllegalArgumentException("Report not found with id: " + id);
        }
        reportRepository.deleteById(id);
    }
}
