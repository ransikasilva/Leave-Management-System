package com.example.leave_management.service.impl;

import com.example.leave_management.model.LeaveBalance;
import com.example.leave_management.model.LeaveType;
import com.example.leave_management.model.Employee;
import com.example.leave_management.repository.LeaveBalanceRepository;
import com.example.leave_management.repository.LeaveTypeRepository;
import com.example.leave_management.repository.EmployeeRepository;
import com.example.leave_management.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveBalanceServiceImpl implements LeaveBalanceService {
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public LeaveBalanceServiceImpl(
            LeaveBalanceRepository leaveBalanceRepository,
            LeaveTypeRepository leaveTypeRepository,
            EmployeeRepository employeeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<LeaveBalance> findAllLeaveBalances() {
        return leaveBalanceRepository.findAll();
    }

    @Override
    public Optional<LeaveBalance> findLeaveBalanceById(String id) {
        return leaveBalanceRepository.findById(id);
    }

    @Override
    public List<LeaveBalance> findLeaveBalancesByEmployee(String employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId);
    }

    @Override
    public List<LeaveBalance> findLeaveBalancesByEmployeeAndYear(String employeeId, int year) {
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year);
    }

    @Override
    public Optional<LeaveBalance> findLeaveBalanceByEmployeeAndLeaveTypeAndYear(
            String employeeId, String leaveTypeId, int year) {
        return leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employeeId, leaveTypeId, year);
    }

    @Override
    public List<LeaveBalance> findLeaveBalancesByLeaveType(String leaveTypeId) {
        return leaveBalanceRepository.findByLeaveTypeId(leaveTypeId);
    }

    @Override
    public List<LeaveBalance> findLeaveBalancesByYear(int year) {
        return leaveBalanceRepository.findByYear(year);
    }

    @Override
    public LeaveBalance saveLeaveBalance(LeaveBalance leaveBalance) {
        updateAvailableBalance(leaveBalance);
        return leaveBalanceRepository.save(leaveBalance);
    }

    @Override
    public LeaveBalance updateLeaveBalance(LeaveBalance leaveBalance) {
        updateAvailableBalance(leaveBalance);
        return leaveBalanceRepository.save(leaveBalance);
    }

    @Override
    public void deleteLeaveBalance(String id) {
        leaveBalanceRepository.deleteById(id);
    }

    @Override
    public LeaveBalance allocateLeaveBalance(String employeeId, String leaveTypeId, int year, double amount) {
        Optional<LeaveBalance> existingBalanceOpt = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);

        if (existingBalanceOpt.isPresent()) {
            LeaveBalance existingBalance = existingBalanceOpt.get();
            existingBalance.setTotalAllocated(existingBalance.getTotalAllocated() + amount);

            LeaveBalance.BalanceHistory historyEntry = new LeaveBalance.BalanceHistory();
            historyEntry.setDate(LocalDate.now());
            historyEntry.setAction("ALLOCATION");
            historyEntry.setValue(amount);
            historyEntry.setDescription("Additional leave allocation");

            existingBalance.getHistory().add(historyEntry);

            updateAvailableBalance(existingBalance);
            return leaveBalanceRepository.save(existingBalance);
        } else {
            LeaveBalance newBalance = new LeaveBalance();
            newBalance.setEmployeeId(employeeId);
            newBalance.setLeaveTypeId(leaveTypeId);
            newBalance.setYear(year);
            newBalance.setTotalAllocated(amount);
            newBalance.setUsed(0);
            newBalance.setPending(0);
            newBalance.setCarryForwarded(0);
            newBalance.setAdjustment(0);

            LeaveBalance.BalanceHistory historyEntry = new LeaveBalance.BalanceHistory();
            historyEntry.setDate(LocalDate.now());
            historyEntry.setAction("INITIAL_ALLOCATION");
            historyEntry.setValue(amount);
            historyEntry.setDescription("Initial leave allocation");

            List<LeaveBalance.BalanceHistory> history = new ArrayList<>();
            history.add(historyEntry);
            newBalance.setHistory(history);

            updateAvailableBalance(newBalance);
            return leaveBalanceRepository.save(newBalance);
        }
    }

    @Override
    public LeaveBalance adjustLeaveBalance(String leaveBalanceId, double amount, String reason, String approvedBy) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findById(leaveBalanceId);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            balance.setAdjustment(balance.getAdjustment() + amount);
            balance.setAdjustmentReason(reason);
            balance.setAdjustmentDate(LocalDate.now());
            balance.setAdjustmentApprovedBy(approvedBy);

            LeaveBalance.BalanceHistory historyEntry = new LeaveBalance.BalanceHistory();
            historyEntry.setDate(LocalDate.now());
            historyEntry.setAction("ADJUSTMENT");
            historyEntry.setValue(amount);
            historyEntry.setDescription(reason);

            balance.getHistory().add(historyEntry);

            updateAvailableBalance(balance);
            return leaveBalanceRepository.save(balance);
        }

        return null;
    }

    @Override
    public LeaveBalance deductLeave(String employeeId, String leaveTypeId, int year, double amount, String leaveRequestId) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            balance.setUsed(balance.getUsed() + amount);

            LeaveBalance.BalanceHistory historyEntry = new LeaveBalance.BalanceHistory();
            historyEntry.setDate(LocalDate.now());
            historyEntry.setAction("DEDUCTION");
            historyEntry.setValue(amount);
            historyEntry.setReferenceId(leaveRequestId);
            historyEntry.setDescription("Leave deduction for approved request");

            balance.getHistory().add(historyEntry);

            updateAvailableBalance(balance);
            return leaveBalanceRepository.save(balance);
        }

        return null;
    }

    @Override
    public LeaveBalance refundLeave(String employeeId, String leaveTypeId, int year, double amount, String leaveRequestId) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            balance.setUsed(Math.max(0, balance.getUsed() - amount));

            LeaveBalance.BalanceHistory historyEntry = new LeaveBalance.BalanceHistory();
            historyEntry.setDate(LocalDate.now());
            historyEntry.setAction("REFUND");
            historyEntry.setValue(amount);
            historyEntry.setReferenceId(leaveRequestId);
            historyEntry.setDescription("Leave refund for cancelled request");

            balance.getHistory().add(historyEntry);

            updateAvailableBalance(balance);
            return leaveBalanceRepository.save(balance);
        }

        return null;
    }

    @Override
    public LeaveBalance carryForwardLeaveBalance(String employeeId, String leaveTypeId, int fromYear, int toYear) {
        Optional<LeaveBalance> fromBalanceOpt = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, fromYear);

        Optional<LeaveType> leaveTypeOpt = leaveTypeRepository.findById(leaveTypeId);

        if (fromBalanceOpt.isPresent() && leaveTypeOpt.isPresent()) {
            LeaveBalance fromBalance = fromBalanceOpt.get();
            LeaveType leaveType = leaveTypeOpt.get();

            double availableForCarryForward = fromBalance.getAvailable();

            if (!leaveType.isCarryForward()) {
                return null;
            }

            double carryForwardAmount = Math.min(availableForCarryForward, leaveType.getMaxCarryForwardDays());

            Optional<LeaveBalance> toBalanceOpt = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, toYear);

            LeaveBalance toBalance;

            if (toBalanceOpt.isPresent()) {
                toBalance = toBalanceOpt.get();
            } else {
                toBalance = new LeaveBalance();
                toBalance.setEmployeeId(employeeId);
                toBalance.setLeaveTypeId(leaveTypeId);
                toBalance.setYear(toYear);
                toBalance.setTotalAllocated(0);
                toBalance.setUsed(0);
                toBalance.setPending(0);
                toBalance.setCarryForwarded(0);
                toBalance.setAdjustment(0);
                toBalance.setHistory(new ArrayList<>());
            }

            toBalance.setCarryForwarded(toBalance.getCarryForwarded() + carryForwardAmount);

            LeaveBalance.BalanceHistory historyEntry = new LeaveBalance.BalanceHistory();
            historyEntry.setDate(LocalDate.now());
            historyEntry.setAction("CARRY_FORWARD");
            historyEntry.setValue(carryForwardAmount);
            historyEntry.setDescription("Carry forward from " + fromYear);

            toBalance.getHistory().add(historyEntry);

            updateAvailableBalance(toBalance);
            return leaveBalanceRepository.save(toBalance);
        }

        return null;
    }

    @Override
    public double getAvailableLeaveBalance(String employeeId, String leaveTypeId, int year) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);

        if (balanceOpt.isPresent()) {
            return balanceOpt.get().getAvailable();
        }

        return 0;
    }

    @Override
    public void initializeYearlyLeaveBalances(int year) {
        List<Employee> employees = employeeRepository.findByActive(true);
        List<LeaveType> leaveTypes = leaveTypeRepository.findByActive(true);

        for (Employee employee : employees) {
            for (LeaveType leaveType : leaveTypes) {
                Optional<LeaveBalance> existingBalanceOpt = leaveBalanceRepository
                        .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveType.getId(), year);

                if (existingBalanceOpt.isEmpty()) {
                    allocateLeaveBalance(employee.getId(), leaveType.getId(), year, leaveType.getDefaultDays());
                }
            }
        }
    }

    @Override
    public void initializeEmployeeLeaveBalances(String employeeId, int year) {
        List<LeaveType> leaveTypes = leaveTypeRepository.findByActive(true);

        for (LeaveType leaveType : leaveTypes) {
            Optional<LeaveBalance> existingBalanceOpt = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveType.getId(), year);

            if (existingBalanceOpt.isEmpty()) {
                allocateLeaveBalance(employeeId, leaveType.getId(), year, leaveType.getDefaultDays());
            }
        }
    }

    private void updateAvailableBalance(LeaveBalance balance) {
        double available = balance.getTotalAllocated() + balance.getCarryForwarded()
                + balance.getAdjustment() - balance.getUsed() - balance.getPending();
        balance.setAvailable(Math.max(0, available));
    }
}