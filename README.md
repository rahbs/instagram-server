# instagram clone coding

## Tech stack
### Server
- OS : ubuntu18.04
- WebServer : nginx1.14.0
- Backend-language : nodejs8.10.0

### DB
- DataBase : mysql 5.7.21

### API 리스트
```
Index	Method	URI	Description
1	GET	/test	test API (test 용)
2	GET	/auto-sign-in	자동로그인
3	POST	/sign-in	로그인
4	POST	/sign-up	회원가입
5	GET	/user-info	로그인된 user 정보 조회
6	PATCH	/user-info	로그인된 user 정보 수정
7	POST	/feeds	피드 업로드
8	GET	/users/{userIdx}/feeds	해당 유저의 피드조회
9	PATCH	/feeds/{feedId}	피드 수정
10	DELETE	/feeds/{feedId}	피드 삭제
11	GET	/feeds	피드 목록 조회
12	GET	/feeds/{feedId}	피드 상세 조회
13	POST	/account-type	비공계 계정으로 전환/ 공계계정으로 전환
14	GET	/account-type	비공계/ 공계계정 확인
15	GET	/feeds/{feedId}/comments?limitStart= & limitCount=	댓글 상세보기
16	POST	/feeds/{feedId}/like	피드 좋아요/취소
17	POST	/comments/{commentId}/like	댓글 좋아요 누르기/취소
18	POST	/comments	댓글 업로드
19	DELETE	/comments/{commentId}	댓글 삭제
20	POST	/followRequest	팔로우 요청 보내기
21	GET	/users/{userIdx}/follow?follow= &limitStart= &limitCount =	팔로워/팔로잉 목록 조회
22	POST	/followAccept/{followRequestId}	팔로우요청 수락
23	DELETE	/followAccept/{followRequestId}	(요청받은사람이)팔로우요청 삭제
24	POST	/users/{userIdx}/closeFriend	친한 친구 리스트에 추가
25	POST	/users/{userIdx}/mute?kind=	해당 유저의 게시물 혹은 스토리 숨기기
26	DELETE	/users/{userIdx}/following	팔로우 취소
27	DELETE	/users/{userIdx}/follower	팔로워 삭제
28	POST	/users/{userIdx}/block	차단
29	GET	/users/not-following-user	맞팔로우하지 않은 계정 목록 조회
30	GET	/users?userId=	계정 검색
31	GET	/activities?limitStart= &limitCount=	활동조회
32	POST	/comments/recomment	대댓글생성
33	GET	/comments/{commentId}/recomment?limitStart= & limitCount=	대댓글 조회
34	GET	/stories/uploaded/users	스토리를 올린 유저 목록 조회
35	POST	/stories	스토리 업로드
36	DELETE	/stories/{storyId}	스토리 삭제
37	GET	/stories/{storyId}	스토리 상세보기
38	GET	/stories/{storyId}/read/users	내 스토리 읽은사람 확인
```
