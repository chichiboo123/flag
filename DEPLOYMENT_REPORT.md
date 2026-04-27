# 배포 진단 보고서 (flag.chichiboo.link)

## 1) 증상
- 커스텀 도메인 `https://flag.chichiboo.link/` 접속 시 GitHub Pages 기본 404 화면이 표시됨.

## 2) 원인 분석
- 저장소 루트에는 정적 사이트 진입 파일(`index.html`)이 없음.
- 실제 웹 앱은 `artifacts/flag-palette` 하위의 Vite 프로젝트이며, 빌드 산출물은 `artifacts/flag-palette/dist/public`에 생성됨.
- 기존에는 GitHub Pages에 해당 빌드 산출물을 자동 배포하는 워크플로우가 없어, Pages가 사이트 파일을 받지 못해 404가 발생할 수 있는 구조였음.
- `vite.config.ts`가 `PORT`, `BASE_PATH` 환경변수를 강제하여, CI/Pages 환경에서 값 누락 시 빌드 실패 가능성이 있었음.

## 3) 적용한 수정
- GitHub Actions Pages 배포 워크플로우 추가:
  - 브랜치 `main` 푸시 시 자동 실행
  - `@workspace/flag-palette`만 빌드
  - 산출물 업로드 후 GitHub Pages로 배포
- 커스텀 도메인 유지:
  - 루트 `CNAME` 파일을 빌드 산출물로 복사하여 Pages 배포본에 포함
- SPA 새로고침 대응:
  - `index.html`을 `404.html`로 복사하여 클라이언트 라우팅 경로 새로고침 시 404 완화
- Vite 설정 안정화:
  - `PORT` 미설정 시 기본값 `5173` 사용
  - `BASE_PATH` 미설정 시 기본값 `/` 사용
  - 잘못된 `PORT` 값만 명시적으로 에러 처리

## 4) 운영 체크리스트
1. GitHub 저장소 Settings → Pages에서 Source를 **GitHub Actions**로 설정.
2. DNS에서 `flag.chichiboo.link`가 GitHub Pages 도메인을 가리키는지 확인.
3. Actions의 `Deploy Flag Palette to GitHub Pages` 워크플로우가 성공했는지 확인.
4. 배포 후 `https://flag.chichiboo.link/` 및 주요 경로 새로고침 동작 점검.

## 5) 기대 결과
- `main`에 반영 후 자동 빌드/배포가 수행되어, 커스텀 도메인에서 앱이 정상 노출되어야 함.
