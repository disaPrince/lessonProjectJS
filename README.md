/plsql
params
cRefDates refcursor
pDelim number
pOffset number
p1 Varchar2
p2 Varchar2
BEGIN

  BEGIN
    FOR aa IN
    (SELECT
      COUNT(DISTINCT o.isn) cnt
    FROM
      CashDeskOper o,
      Cashdesk cd,
      docs d,
      subject s,
      agrsumbuh ss
    WHERE
      o.INOUTMEO    IN (1,-1)
      AND d.isn      = o.DOCISN
      AND s.isn      = o.SUBJISN
      AND ss.docisn(+)  = d.isn
      AND cd.isn     = o.CASHDESKISN
      --AND cd.deptisn = :pDicti1ISN
      AND cd.isn = :pDicti1ISN
      AND o.docdate BETWEEN :pPeriod1Beg AND :pPeriod1End
    HAVING
      COUNT(DISTINCT o.isn) = 0
    )
    LOOP
      --RAISE_APPLICATION_ERROR(-20451, 'За указанный период операций по кассе не было');
      null ;
    END LOOP;
  END;

  OPEN :cRefDates FOR
     select dd.* from
     (SELECT :pPeriod1Beg + level - 1 docdate, to_char(:pPeriod1Beg + level - 1,'dd-mm-yyyy') ListName, level lvl FROM dual connect by level < :pPeriod1End - :pPeriod1Beg + 2) dd
     where exists (select 1 from  CashDeskOper o,Cashdesk cd where o.INOUTMEO    IN (1,-1) and o.docdate = dd.docdate AND cd.isn     = o.CASHDESKISN AND cd.isn = :pDicti1ISN)  -- cd.deptisn = :pDicti1ISN
     order by 1 desc;
  :pDelim:=27;           -- кол-во (пко и рко) строк в отчете
  /*case :pDicti2ISN
    when 1 then :p1 := 'DropSheet(1)'; :p2:='DropSheet(2)';
    when 2 then :p1 := 'CopySheet()'; :p2:='';
    else null;
    end case;*/
END;
/

--hideheader
--sheet(1)
select 'на '|| to_char(sysdate,'yyyy')||' г.' A18,
       :pPeriod1Name C21,
       case when nvl(cd.Dept2ISN, cd.DeptISN) = 1000 then 'Директор ОД'
         else 'Директор филиала'
           end as C28,
        nvl(
              (select case when sa.subjisn = 1000 then
                  c.socr||' '||c.Name
                  else
                  'Филиал по '||c.socr||' '||c.Name end
                  from SubAddr sa,
                       City    c
                  where sa.SubjISN  = cd.Dept2ISN
                  and    c.ISN      = sa.CityISN
                  and   sa.ClassISN = Cnt.ISN('cAddrJur')
                  and rownum < 2
                ),
              (select case when sa.subjisn = 1000 then
                  c.socr||' '||c.Name
                  else
                  'Филиал по '||c.socr||' '||c.Name end
                  from SubAddr sa,
                       City    c
                  where sa.SubjISN  = cd.DeptISN
                  and    c.ISN      = sa.CityISN
                  and   sa.ClassISN = Cnt.ISN('cAddrJur')
                  and rownum < 2)) B13,
       nvl(
               (select sb.IIN
                from   Subject sb
                where  sb.isn = cd.Dept2ISN),
               (select sb.IIN
                from   Subject sb
                where  sb.isn = cd.DeptISN)) K7,
        case when nvl(cd.Dept2ISN, cd.DeptISN) = 1000 then
              (select shortname from subject where isn=1445722)
        else
        ( select dt.shortname from v_dutymain dt where  dt.EndCareer is null   and dt.DutyISN in(617) and dt.deptisn =  cd.Dept2ISN  )
      end as K28

from Cashdesk cd
where cd.ISN = :pDicti1ISN

/

SELECT
  COUNT(pagenumber) H25,
  str_utils.getfulldate(sysdate) I33
FROM
  ( SELECT DISTINCT
    o.docdate,
    ceil(dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC)/(:pDelim)) pagenumber
  FROM
    CashDeskOper o,
    Cashdesk    cd,
    docs         d,
    subject      s,
    agrsumbuh    ss
  WHERE
    o.INOUTMEO    IN (1,-1)
    AND d.isn         = o.DOCISN
    AND s.isn         = o.SUBJISN
    AND ss.docisn(+)  = d.isn
    AND cd.isn        = o.CASHDESKISN
    --AND cd.deptisn  = :pDicti1ISN
    AND cd.ISN        = :pDicti1ISN
    AND o.docdate BETWEEN :pPeriod1Beg AND :pPeriod1End
  )
/
--Sheet(2)
select dt.DutyName as D11,
       dt.shortname as I12,
       s.shortname as I15
from v_dutymain dt ,subject s
where dt.SubjectISN = 1445722 and dt.EndCareer is null  and s.isn = 1445912



/LOOP(cRefDates)
  --Sheet(3)
  select ' ' A1 from dual
  /

  --CopySheet(%cRefDates.ListName%)
  select ' ' A1 from dual
  /

/ PLSQL
params
cRefTable refcursor
BEGIN
  OPEN :cRefTable FOR
    SELECT
  distinct
  ceil(dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC)/(:pDelim)) pagenumber
FROM
  CashDeskOper o,
  Cashdesk    cd,
  docs         d,
  subject      s,
  agrsumbuh    ss
WHERE
  o.INOUTMEO   IN (1,-1)
  AND d.isn        = o.DOCISN
  AND s.isn        = o.SUBJISN
  AND ss.docisn(+) = d.isn
  and cd.isn       = o.CASHDESKISN
--  and cd.deptisn = :pDicti1ISN
  and cd.isn    = :pDicti1ISN
  AND o.docdate = :%cRefDates.docdate%
union
select   1 from dual
order by 1 desc;

SELECT
  COUNT(pagenumber) into :pOffset
FROM
  ( SELECT DISTINCT
    o.docdate,
    ceil(dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC)/(:pDelim)) pagenumber
  FROM
    CashDeskOper o ,
    Cashdesk    cd ,
    docs         d ,
    subject      s ,
    agrsumbuh    ss
  WHERE
    o.INOUTMEO    IN (1,-1)
    AND d.isn      = o.DOCISN
    AND s.isn      = o.SUBJISN
    AND ss.docisn(+)  = d.isn
    AND cd.isn     = o.CASHDESKISN
    --AND cd.deptisn = :pDicti1ISN
    AND cd.isn = :pDicti1ISN
    AND o.docdate BETWEEN
        &mFromStart :pPeriod1Beg
        AND :%cRefDates.docdate%-1);
END;
/

select shortname E13 from subject where isn = :pEmpl1ISN
/

select shortname E17 from subject where isn = :pEmpl2ISN
/

SELECT
  nvl(inc,0) E9,
  nvl(exc,0) F9,
  nvl(inc,0)+nvl(saldobeg,0)-nvl(exc,0) E10,
  'Записи в кассовой книге проверил и документы в количестве '||regexp_replace(STR_UTILS.NUM2WORD(incdoc),' [^ ]+ [^ ]+ [^ ]+$')||' приходных и '||regexp_replace(STR_UTILS.NUM2WORD(excdoc),' [^ ]+ [^ ]+ [^ ]+$')||' расходных получил.' B15
FROM
  (SELECT
    SUM(
    CASE o.inoutmeo
      WHEN 1
      THEN d.amount
    END) inc,
    SUM(
    CASE o.inoutmeo
      WHEN -1
      THEN d.amount
    END) exc,
    COUNT(
    CASE o.inoutmeo
      WHEN 1
      THEN d.amount
    END) incdoc,
    COUNT(
    CASE o.inoutmeo
      WHEN -1
      THEN d.amount
    END) excdoc
  FROM
    CashDeskOper o,
    Cashdesk cd,
    docs d,
    subject s,
    agrsumbuh ss
  WHERE
    o.INOUTMEO    IN (1,-1)
    AND d.isn      = o.DOCISN
    AND s.isn      = o.SUBJISN
    AND ss.docisn  = d.isn
    AND cd.isn     = o.CASHDESKISN
    --AND cd.deptisn = :pDicti1ISN
    AND cd.isn = :pDicti1ISN
    AND o.docdate  = :%cRefDates.docdate%
  ) cdo,
  (
  SELECT
      SUM(cs.saldoend) saldobeg
    FROM
      CASHDESKSALDO cs,
      cashdesk cd
    WHERE
      cs.datebeg         = :%cRefDates.docdate%-1
      AND cs.CASHDESKISN = cd.isn
      AND cd.isn     = :pDicti1ISN
      --AND cd.deptisn     = :pDicti1ISN
  ) cds
/




  / LOOP (cRefTable)
      -- Repcross COPYPREVROW(6)
      select
            2 as ExlRow
       from dual
      /
     select 'Касса за '||str_utils.getfulldate(:%cRefDates.docdate%)||case when :%cRefTable.pagenumber% <> 1 then '<HPAGEBREAK>' else '' end as B9, 'Лист '||(:%cRefTable.pagenumber%+:pOffset) E9  from dual
     /

--reptableinl(B13)
SELECT
    id,
    fullname,
    acc,
    inc,
    exc,
    id,
    fullname,
    acc,
    inc,
    exc
  FROM
    (SELECT
      id,
      fullname,
      acc,
      inc,
      exc,
      rownumber,
      pagenumber
    FROM
      (SELECT
        d.id||chr(10) || '<h6>' ||to_char(d.created,'dd.mm.yyyy hh24:mi:ss') || '</h6>' || '<#html#>' id,
        s.fullname||case when 0 = 1 &mCheck2 then ', '||d.remark end fullname,
        CASE o.inoutmeo
          WHEN 1
          THEN ss.credit
          WHEN -1
          THEN nvl(debet,'1250.03')  -- по РКО подотчет ставим 1250.03  Кайрат 21-11-2017
        END acc,
        CASE o.inoutmeo
          WHEN 1
          THEN d.amount
        END inc,
        CASE o.inoutmeo
          WHEN -1
          THEN d.amount
        END exc,
        lag(o.docdate) over (order by o.docdate DESC, d.id) lagdocdate,
        dense_rank() over (order by o.docdate DESC) listnumber,
        ceil(dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC)/(:pDelim)) pagenumber,
        dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC) rownumber
      FROM
        CashDeskOper o,
        Cashdesk cd,
        docs d,
        subject s,
        agrsumbuh ss
      WHERE
        o.INOUTMEO   IN (1,-1)
        AND d.isn     = o.DOCISN
        AND s.isn     = o.SUBJISN
        AND ss.docisn(+) = d.isn
        and cd.isn    = o.CASHDESKISN
        --and cd.deptisn = :pDicti1ISN
        and cd.isn = :pDicti1ISN
        AND o.docdate = :%cRefDates.docdate%
      )
    UNION
    SELECT
      id,
      fullname,
      acc,
      inc,
      exc,
      rownumber,
      pagenumber
    FROM
      (SELECT
        NULL id,
        'Перенесено на следующий лист <ROWBFNT>' fullname,
        NULL acc,
        SUM(
        CASE o.inoutmeo
          WHEN 1
          THEN d.amount
        END) over (order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC rows :pDelim preceding) inc,
        SUM(
        CASE o.inoutmeo
          WHEN -1
          THEN d.amount
        END) over (order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC rows :pDelim preceding) exc,
        lag(o.docdate) over (order by o.docdate DESC, d.id) lagdocdate,
        dense_rank() over (order by o.docdate DESC) listnumber,
        ceil(dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC)/(:pDelim)) pagenumber,
        dense_rank() over (partition BY o.docdate order by o.docdate DESC, d.classisn, regexp_substr(d.id,'[0-9]+$') ASC)     +0.1 rownumber,
        count(*) over () cnt
      FROM
        CashDeskOper o,
        Cashdesk cd,
        docs d,
        subject s,
        agrsumbuh ss
      WHERE
        o.INOUTMEO   IN (1,-1)
        AND d.isn     = o.DOCISN
        AND s.isn     = o.SUBJISN
        AND ss.docisn(+) = d.isn
        and cd.isn    = o.CASHDESKISN
        --and cd.deptisn = :pDicti1ISN
        and cd.isn = :pDicti1ISN
        AND o.docdate = :%cRefDates.docdate%
      )
    WHERE
      mod(rownumber-0.1,:pDelim) = 0 and cnt <> :pDelim
    union
    SELECT
      NULL,
      'Остаток на начало дня <ROWBFNT>',
      NULL,
      nvl(SUM(cs.SALDOend),0),
      null,
      0 rownumber,
      1 pagenumber
    FROM
      CASHDESKSALDO cs,
      cashdesk cd
    WHERE
      cs.datebeg         = :%cRefDates.docdate%-1
      AND cs.CASHDESKISN = cd.isn
      AND cd.isn     = :pDicti1ISN
      --AND cd.deptisn     = :pDicti1ISN
    )
  where
    pagenumber = :%cRefTable.pagenumber%
  ORDER BY
    pagenumber desc ,rownumber
/
  /END LOOP(cRefTable)

--Reptable(A2)
select '<ROWHEIGHT=0>' from dual connect by level < 7
/

select 'x<CMRH> ' F13,'x<CMRH> ' K13 from dual
/

/END LOOP(cRefDates)

--DropSheet(3)
select ' ' A1 from dual
/

--Sheet(1)
select ' ' A1 from dual
/
