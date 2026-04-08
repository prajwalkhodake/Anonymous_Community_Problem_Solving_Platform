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
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByStatus("PENDING");
    }

    public void dismissReport(Long id) {
        reportRepository.findById(id).ifPresent(report -> {
            report.setStatus("RESOLVED");
            reportRepository.save(report);
        });
    }

    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
