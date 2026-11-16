#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p reports

echo "================================================================="
echo "   SMART TIME CHECKING - ROBOT FRAMEWORK AUTOMATION RUNNER       "
echo "================================================================="

TARGET=${1:-"all"}

case "$TARGET" in
  api)
    echo ">> Chạy bộ kiểm thử API RESTful..."
    robot --outputdir reports --loglevel INFO tests/01_api/
    ;;
  ui)
    echo ">> Chạy bộ kiểm thử Giao diện & Hành vi UI..."
    robot --outputdir reports --loglevel INFO tests/02_ui/
    ;;
  flow)
    echo ">> Chạy bộ kiểm thử Toàn trình Vòng đời Nghiệp vụ (E2E Flow)..."
    robot --outputdir reports --loglevel INFO tests/03_flow/
    ;;
  smoke)
    echo ">> Chạy bộ kiểm thử Smoke Test (P0 Critical)..."
    robot --outputdir reports --include SMOKE tests/
    ;;
  all)
    echo ">> Chạy TOÀN BỘ kịch bản kiểm thử (API + UI + E2E Flow)..."
    robot --outputdir reports --loglevel INFO tests/
    ;;
  *)
    echo "Cách dùng: ./run_tests.sh [api | ui | flow | smoke | all]"
    exit 1
    ;;
esac

echo "================================================================="
echo ">> Kiểm thử hoàn tất! Báo cáo HTML đã xuất tại:"
echo "   - Báo cáo tổng hợp: file://$SCRIPT_DIR/reports/report.html"
echo "   - Nhật ký chi tiết: file://$SCRIPT_DIR/reports/log.html"
echo "================================================================="

