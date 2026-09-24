$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$session.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_mtk_guid", "116c8f95305a4a6fac4b79940e23a54a", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_login_acctype", "6", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_lang", "en-US", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_visitor_guid", "c20b03173f4d4b858e90bdb3b687430a", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("OnetrustActiveGroups", "C0001C0002C0003C0004", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("OptanonAlertBoxClosed", "2026-03-03T13:18:26.704Z", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_svn", "unab-cl", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("wULrMv6t", "A_OPLvOcAQAAwmHykQAhDm0EOvuh8DSsASqENLKWKHXdKA_4HFZN93ydPxzXAchWw8uucmVTwH8AAEB3AAAAAA|1|0|9ea33227c044ab33cfc5fedfe194feb38711d60d", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_ga", "GA1.1.528460027.1773606446", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_yjsu_yjad", "1773606447.e4497837-d7b8-42a6-95c7-945b5ec3a455", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_tracking_guid", "9b2732b72e4d403b8e540edfc41baaf8", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("optimizelySession", "0", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_uetvid", "623dae5020ad11f1adf42f315ab088fa", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("AMP_MKTG_0753e77572", "JTdCJTdE", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_fingerprint", "a3a9b67b2aa35a583ec27947302f799f", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("IR_PI", "60f277e9-20ad-11f1-9c2f-a5885e0ee047%7C1788643799011", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_ga_L8TBF28DDX", "GS2.1.s1788557380`$o5`$g1`$t1788557523`$j60`$l0`$h0", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_multi_ac", "~USER_CRYPTO~DFbgFhpfOUFtNTBjMgAA6QAAAIRLtTX2T-EcuDVxQnSfVVNv9LmOFVfCSEsmWGsLNQXt0ySM1SeHyUgwJcqcMfqjT5JfI9use3pc6Fta1mrFNy0yolwAazmJU9Rhpx9cWIOIiBWD4HTapm5t3DBuX1nJ4EHmmCbJZ6DC82vyOgMT3fIZohkc5Wl6fHJiGD6Nsy8Iajr7Rda9FxiK_FCs9X6JpJK2N5FgoP2J9xraFczjBzRctpCiSSdfpAklQfot_9f2I0Cv-mvmacDIJohNsp2AGVCvlEyXbpBeBbMlBWJWKC2nrNohJHtKsCVZ6raCcAkuCeUKRJV2IOg_MRPFxJIR1j7J_m83zyt3wTAwMDAwMQ", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_kms", "us02_c_MEclMkZ6bFlqTFRlbHgyRVZTNlJHU29RJTNEJTNEOnZQMEh3WXVqd1BJTm95NXFYR0xmeXclM0QlM0Q", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_ssid", "us02_c_k9KcOHXESrSszKNN1FFuKQ", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("zm_cluster", "us02", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("zm_aid", "2GZ9-gk2QxWul0ASeOhJBg", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("zm_haid", "383", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("zm_web_domain", "us02web.zoom.us", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("zm_huid", "53ec7066ad15425e09dab4e628f3ad0f", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_page_auth", "us02_c_5bpTvaIpQ_u315bNPGOdqQ", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_cms_guid", "DJfwHfVTM1wRDOdASwAAFgAAAKpPGd7vGexkKBg6g6UeQd-c--UIUU1hQhfjjvpLIeNnj_kgEgPWMDAwMDAx", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_date_format", "dd/mm/yy", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_date_format_standard", "DD/MM/YYYY", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_12-hour", "1", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_start_day_of_week", "7", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_csp_script_nonce", "N9QPzctZRAmI6XNlu95szg", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_currency", "USD", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("__Secure-Fgp", "0E4A0C626EDCBF5C4CFB039A33E778EAF9237FF6D5EE065BB430506C205A613B", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("session_tracker", "281b13e5-7f3b-48d8-be48-400580216e9e", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("_zm_docs_has_nak", "1", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("__utmzz", "campaign=(not set)", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("__utmzzses", "campaign=(not set)", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("AMP_0753e77572", "JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjJkMWU2ZjgwNi0xNGM4LTQ4MWMtOGMwZS05M2MyMjE0ZmRhMWIlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzg4OTg2NzYxMDU5JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc4ODk4Njc2MTA2NCUyQyUyMmxhc3RFdmVudElkJTIyJTNBNTclMkMlMjJwYWdlQ291bnRlciUyMiUzQTElMkMlMjJjb29raWVEb21haW4lMjIlM0ElMjIuem9vbS51cyUyMiU3RA==", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("__cf_bm", "qCgBIvgRkRhRO6UIQh5iSFEE.WtLLCpL35.YAub7Dbs-1788986811-1.0.1.1-4kXUDHrJ0BbhyXYeO39ld4q9nxbOrmbzr1h6hqb9ZxkX4fN6icq58Ns0mJiBSx847ozIGVvd8DTT.NINfaDHePgpaieg9RlAAshZtJwEjxA", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("OptanonConsent", "isGpcEnabled=0&datestamp=Wed+Sep+09+2026+17%3A54%3A01+GMT-0300+(hora+de+verano+de+Chile)&version=6.21.0&isIABGlobal=false&hosts=&consentId=ca25dde1-7abc-41df-bd40-e139d4166523&interactionCount=2&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&geolocation=CL%3BVS&AwaitingReconsent=false", "/", ".zoom.us")))
$session.Cookies.Add((New-Object System.Net.Cookie("cf_clearance", "NUGR2tGiIx5x6K.4jc0tPUKOIbijEUYubTo0CWqeLao-1788987240-1.2.1.1-XRPfjcz2zlvKdhRxEDPVH8QIO3D4o.W4AZsCM0Ps0nai0H3DHMwziTeipK568lX4jrr3bP4TuX1M6FCZX4QEKf6mgKQJFQR1txAlrfuBIS1TaZvI8oMuX3m4RjY.hu.WoTnTa9xykuoT3SLO229NDUxCSi6SNGLLHOp.oR7sR4q2cIEQMGGIcDZ22MbhqKiWeTdcVgE8U1hH9xXUNsCovahb1Vy5QgPWPgyAItqthYKhqLM1Zw3yyF6n0H8Y8SHySiO50_j5Rdakjkx.D3xv3v.mJTzVqi2vfUTBxTRLuQIc_XCrKczFQXL__GcZDGpE0bZQqiMUyPQ1UMh1uFi8d9O0iB0InV4TLMN9dMwfBDc", "/", ".zoom.us")))
Write-Host "Iniciando descarga del video..."
Invoke-WebRequest -UseBasicParsing -Uri "https://ssrweb.zoom.us/replay03/2026/09/08/77D8FA4C-48E6-4387-806E-388CBB8CAED4/GMT20260908-172925_Recording_2380x1546.mp4?response-content-type=video%2Fmp4&response-cache-control=max-age%3D0%2Cs-maxage%3D86400&data=dc8bdc710fe002496e8a8edac3276c1bce1495bbcc4d5c4e987d618a9d11d9e9&s001=yes&cid=us02&fid=11cWcsqIEo8au3LhIGQFKHLhdSvR5SlLfMQ9mO8BMOJ_Gbyf0DfGJchrweDqe8XtY-ETPfsrfrEHswen.q7uTOgDSuo2wa6Kb&s002=vE-nM85EUb8Ie1Khh9SrSG8TvUbwBOO6eNvrbSAc1mES-xqQm2xGJUAdIw.1B2NN8JROKRcoZz7&tid=v=2.0;clid=us02;rid=WEB_3efed6ba465e53d3337e57edd1fb2f70&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vc3Nyd2ViLnpvb20udXMvcmVwbGF5MDMvMjAyNi8wOS8wOC83N0Q4RkE0Qy00OEU2LTQzODctODA2RS0zODhDQkI4Q0FFRDQvR01UMjAyNjA5MDgtMTcyOTI1X1JlY29yZGluZ18yMzgweDE1NDYubXA0P3Jlc3BvbnNlLWNvbnRlbnQtdHlwZT12aWRlbyUyRm1wNCZyZXNwb25zZS1jYWNoZS1jb250cm9sPW1heC1hZ2UlM0QwJTJDcy1tYXhhZ2UlM0Q4NjQwMCZkYXRhPWRjOGJkYzcxMGZlMDAyNDk2ZThhOGVkYWMzMjc2YzFiY2UxNDk1YmJjYzRkNWM0ZTk4N2Q2MThhOWQxMWQ5ZTkmczAwMT15ZXMmY2lkPXVzMDImZmlkPTExY1djc3FJRW84YXUzTGhJR1FGS0hMaGRTdlI1U2xMZk1ROW1POEJNT0pfR2J5ZjBEZkdKY2hyd2VEcWU4WHRZLUVUUGZzcmZyRUhzd2VuLnE3dVRPZ0RTdW8yd2E2S2ImczAwMj12RS1uTTg1RVViOEllMUtoaDlTclNHOFR2VWJ3Qk9PNmVOdnJiU0FjMW1FUy14cVFtMnhHSlVBZEl3LjFCMk5OOEpST0tSY29aejcmdGlkPXY9Mi4wO2NsaWQ9dXMwMjtyaWQ9V0VCXzNlZmVkNmJhNDY1ZTUzZDMzMzdlNTdlZGQxZmIyZjcwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzg5MDAwNzk1fX19XX0_&Signature=eRCKozyUm8zQCw9rndnoxm6qVNutyhAe6xaE18Gt2cUSj7DR1uMagl9-NrjkgZE1HzwlCsU6TxVTZfgfVwMtI9GSNo68hnot0qDM4XULjSrQFxiZywsGvi3kqVamNF09e1K2rwIbXSI6vFjrUKssPi44vfkKeIdZRt0T7dOeHerTUCwk9RUNLyLYe82OvuANlYlD8RBXpzwzrAcAuxN~jaikk-TUmNrx82EfK~PISJt98kvUHYqccRW3derAsKQlWbWbVd6oLQs548uvTDH4LyltHIYnMPTGilFSVC2N3XkwouNKo6jK5ZNXmtX76TuyQ9lDt6qAM-G5NEDDiji7sw__&Key-Pair-Id=K1YYCGW8V4AHXW" `
-WebSession $session `
-OutFile "grabacion_zoom.mp4" `
-Headers @{
"Accept"="*/*"
  "Accept-Encoding"="identity;q=1, *;q=0"
  "Accept-Language"="es-ES,es;q=0.9,es-CL;q=0.8"
  "Referer"="https://unab-cl.zoom.us/"
  "Sec-Fetch-Dest"="video"
  "Sec-Fetch-Mode"="no-cors"
  "Sec-Fetch-Site"="same-site"
  "sec-ch-ua"="`"Chromium`";v=`"152`", `"Not?A_Brand`";v=`"24`", `"Google Chrome`";v=`"152`""
  "sec-ch-ua-mobile"="?0"
  "sec-ch-ua-platform"="`"Windows`""
}
Write-Host "Descarga finalizada."
