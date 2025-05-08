---
title: "PSA: AI can optimise your database"
kind: article
author: Atharva Raykar
created_at: 2025-05-08 00:00:00 UTC
layout: post
---
In the days of yore (November 2024), before there was a 'vibe' before 'code', I was to optimise a query in PostgreSQL.

This was a query we used to generate a materialised view, which is a denormalised view of our transactional tables. This query was huge and slow.

I did what any well-bred engineer must do.

```
EXPLAIN ANALYZE <my slow query>
```

After waiting a cool 13 minutes, I was met with a rather friendly output that approximately looked like this.
<details>
    <summary>Rather Friendly Output</summary>
  <pre>                                                                                                                                                            QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Unique  (cost=147483011.14..167439265.44 rows=164294334 width=1144) (actual time=722391.777..810633.458 rows=30302109 loops=1)
   Buffers: shared hit=1741739 read=6483035, temp read=8284857 written=8284920
   InitPlan 1 (returns $0)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.005..0.006 rows=1 loops=1)
   InitPlan 2 (returns $1)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.001..0.001 rows=1 loops=1)
   InitPlan 3 (returns $2)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.000..0.001 rows=1 loops=1)
   InitPlan 4 (returns $3)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.001..0.001 rows=1 loops=1)
   InitPlan 5 (returns $4)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.000..0.001 rows=1 loops=1)
   InitPlan 6 (returns $5)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.000..0.000 rows=1 loops=1)
   InitPlan 7 (returns $6)
     ->  Result  (cost=0.00..0.01 rows=1 width=32) (actual time=0.000..0.001 rows=1 loops=1)
   ->  Gather Merge  (cost=147483011.06..166617793.68 rows=164294334 width=1144) (actual time=722391.776..802478.439 rows=30302466 loops=1)
         Workers Planned: 2
         Params Evaluated: $0, $1, $2, $3, $4, $5, $6
         Workers Launched: 2
         Buffers: shared hit=1741739 read=6483035, temp read=8284857 written=8284920
         ->  Sort  (cost=147482011.03..147653150.96 rows=68455972 width=1144) (actual time=715857.887..740498.116 rows=10100822 loops=3)
               Sort Key: p.id, (date(generate_series.generate_series))
               Sort Method: external merge  Disk: 8018120kB
               Buffers: shared hit=1741739 read=6483035, temp read=8284857 written=8284920
               Worker 0:  Sort Method: external merge  Disk: 7355864kB
               Worker 1:  Sort Method: external merge  Disk: 8640448kB
               ->  Hash Join  (cost=98111314.34..118564254.21 rows=68455972 width=1144) (actual time=492147.822..658887.066 rows=10100822 loops=3)
                     Hash Cond: (p.assigned_facility_id = facilities_1.id)
                     Buffers: shared hit=1741715 read=6483035, temp read=5283053 written=5283097
                     ->  Hash Join  (cost=98109366.95..104872071.62 rows=91127708 width=771) (actual time=492119.505..622548.440 rows=10100822 loops=3)
                           Hash Cond: (p.registration_facility_id = facilities.id)
                           Buffers: shared hit=1725066 read=6483035, temp read=5283053 written=5283097
                           ->  Parallel Hash Left Join  (cost=98107419.55..103503670.57 rows=121380417 width=567) (actual time=492093.262..616028.266 rows=10100822 loops=3)
                                 Hash Cond: (p.id = mh.patient_id)
                                 Buffers: shared hit=1708494 read=6483035, temp read=5283053 written=5283097
                                 ->  Parallel Hash Left Join  (cost=98080217.47..102515540.51 rows=121380417 width=546) (actual time=491136.330..609022.395 rows=10100703 loops=3)
                                       Hash Cond: (((date(generate_series.generate_series)) = current_meds.month_date) AND (p.id = current_meds.patient_id))
                                       Buffers: shared hit=1708487 read=6464916, temp read=5283053 written=5283097
                                       ->  Merge Left Join  (cost=97339331.57..101137407.41 rows=121380417 width=490) (actual time=478426.540..586040.062 rows=10100703 loops=3)
                                             Merge Cond: ((p.id = visits.patient_id) AND ((date_part('month'::text, (date(generate_series.generate_series))::timestamp without time zone)) = visits.month) AND ((date_part('year'::text, (date(generate_series.generate_series))::timestamp without time zone)) = visits.year))
                                             Buffers: shared hit=1708456 read=6032108, temp read=5283053 written=5283097
                                             ->  Merge Left Join  (cost=90908457.78..93415961.47 rows=121380417 width=380) (actual time=328651.162..381108.622 rows=10100703 loops=3)
                                                   Merge Cond: ((p.id = bss.patient_id) AND ((date_part('month'::text, (date(generate_series.generate_series))::timestamp without time zone)) = bss.month) AND ((date_part('year'::text, (date(generate_series.generate_series))::timestamp without time zone)) = bss.year))
                                                   Buffers: shared hit=877268 read=3615121, temp read=3737608 written=3737637
                                                   ->  Merge Left Join  (cost=87713534.81..89105634.05 rows=121380417 width=297) (actual time=260760.226..283927.994 rows=10100703 loops=3)
                                                         Merge Cond: ((p.id = bps.patient_id) AND ((date_part('month'::text, (date(generate_series.generate_series))::timestamp without time zone)) = bps.month) AND ((date_part('year'::text, (date(generate_series.generate_series))::timestamp without time zone)) = bps.year))
                                                         Buffers: shared hit=637268 read=2409751, temp read=2946655 written=2946675
                                                         ->  Sort  (cost=84884016.92..85187467.96 rows=121380417 width=233) (actual time=223534.131..229667.871 rows=10100703 loops=3)
                                                               Sort Key: p.id, (date_part('month'::text, (date(generate_series.generate_series))::timestamp without time zone)), (date_part('year'::text, (date(generate_series.generate_series))::timestamp without time zone))
                                                               Sort Method: external merge  Disk: 2017832kB
                                                               Buffers: shared hit=12271 read=1324196, temp read=2393566 written=2393583
                                                               Worker 0:  Sort Method: external merge  Disk: 1852792kB
                                                               Worker 1:  Sort Method: external merge  Disk: 2166392kB
                                                               ->  Merge Left Join  (cost=58777872.69..60566753.73 rows=121380417 width=233) (actual time=170776.950..198032.261 rows=10100703 loops=3)
                                                                     Merge Cond: ((p.id = past_meds.patient_id) AND ((date(generate_series.generate_series)) = ((past_meds.month_date + '1 mon'::interval))))
                                                                     Buffers: shared hit=12256 read=1324196, temp read=1638939 written=1638952
                                                                     ->  Sort  (cost=53609605.02..53913056.06 rows=121380417 width=177) (actual time=119032.085..122431.595 rows=10100703 loops=3)
                                                                           Sort Key: p.id, (date(generate_series.generate_series))
                                                                           Sort Method: external merge  Disk: 1469424kB
                                                                           Buffers: shared hit=10003 read=28001, temp read=549504 written=549508
                                                                           Worker 0:  Sort Method: external merge  Disk: 1348976kB
                                                                           Worker 1:  Sort Method: external merge  Disk: 1577632kB
                                                                           ->  Nested Loop Left Join  (cost=0.43..30993327.29 rows=121380417 width=177) (actual time=1.080..97127.461 rows=10100703 loops=3)
                                                                                 Join Filter: (to_char(timezone($6, ti
                                                                                 Rows Removed by Join Filter: 14084142
                                                                                 Buffers: shared hit=10003 read=28001
                                                                                 ->  Parallel Index Scan using index_patients_on_registration_facility_id on patients p  (cost=0.42..37700.88 rows=364141 width=85) (actual time=0.740..947.656 rows=291384 loops=3)
                                                                                       Filter: (deleted_at IS NULL)
                                                                                       Rows Removed by Filter: 3
                                                                                       Buffers: shared hit=10003 read=28001
                                                                                 ->  Function Scan on generate_series  (cost=0.01..50.01 rows=1000 width=92) (actual time=0.003..0.210 rows=83 loops=874151)
                                                                     ->  Materialize  (cost=5168267.67..5316144.58 rows=29575382 width=76) (actual time=51744.779..64303.050 rows=30296480 loops=3)
                                                                           Buffers: shared hit=2253 read=1296195, temp read=1089435 written=1089444
                                                                           ->  Sort  (cost=5168267.67..5242206.12 rows=29575382 width=76) (actual time=51744.772..59383.676 rows=30296480 loops=3)
                                                                                 Sort Key: past_meds.patient_id, ((past_meds.month_date + '1 mon'::interval))
                                                                                 Sort Method: external merge  Disk: 2905160kB
                                                                                 Buffers: shared hit=2253 read=1296195, temp read=1089435 written=1089444
                                                                                 Worker 0:  Sort Method: external merge  Disk: 2905160kB
                                                                                 Worker 1:  Sort Method: external merge  Disk: 2905160kB
                                                                                 ->  Seq Scan on reporting_prescriptions past_meds  (cost=0.00..728562.82 rows=29575382 width=76) (actual time=0.028..18434.616 rows=30296531 loops=3)
                                                                                       Buffers: shared hit=2232 read=1296195
                                                         ->  Materialize  (cost=2829517.89..2900638.36 rows=14224095 width=96) (actual time=37226.040..44417.758 rows=14220140 loops=3)
                                                               Buffers: shared hit=624997 read=1085555, temp read=553089 written=553092
                                                               ->  Sort  (cost=2829517.89..2865078.12 rows=14224095 width=96) (actual time=37226.030..42058.968 rows=14220140 loops=3)
                                                                     Sort Key: bps.patient_id, bps.month, bps.year
                                                                     Sort Method: external merge  Disk: 1474904kB
                                                                     Buffers: shared hit=624997 read=1085555, temp read=553089 written=553092
                                                                     Worker 0:  Sort Method: external merge  Disk: 1474904kB
                                                                     Worker 1:  Sort Method: external merge  Disk: 1474904kB
                                                                     ->  Seq Scan on reporting_patient_blood_pressures bps  (cost=0.00..712424.95 rows=14224095 width=96) (actual time=3.005..20115.049 rows=14220155 loops=3)
                                                                           Buffers: shared hit=624997 read=1085555
                                                   ->  Materialize  (cost=3194922.97..3276716.30 rows=16358665 width=115) (actual time=67890.854..88371.933 rows=16359636 loops=3)
                                                         Buffers: shared hit=240000 read=1205370, temp read=790953 written=790962
                                                         ->  Sort  (cost=3194922.97..3235819.63 rows=16358665 width=115) (actual time=67890.846..85576.596 rows=16359636 loops=3)
                                                               Sort Key: bss.patient_id, bss.month, bss.year
                                                               Sort Method: external merge  Disk: 2109200kB
                                                               Buffers: shared hit=240000 read=1205370, temp read=790953 written=790962
                                                               Worker 0:  Sort Method: external merge  Disk: 2109216kB
                                                               Worker 1:  Sort Method: external merge  Disk: 2109208kB
                                                               ->  Seq Scan on reporting_patient_blood_sugars bss  (cost=0.00..645376.65 rows=16358665 width=115) (actual time=3.289..18358.264 rows=16359684 loops=3)
                                                                     Buffers: shared hit=240000 read=1205370
                                             ->  Materialize  (cost=6430873.80..6582540.11 rows=30333262 width=142) (actual time=149775.245..191096.813 rows=30296481 loops=3)
                                                   Buffers: shared hit=831188 read=2416987, temp read=1545445 written=1545460
                                                   ->  Sort  (cost=6430873.80..6506706.95 rows=30333262 width=142) (actual time=149775.240..185877.227 rows=30296481 loops=3)
                                                         Sort Key: visits.patient_id, visits.month, visits.year
                                                         Sort Method: external merge  Disk: 4121184kB
                                                         Buffers: shared hit=831188 read=2416987, temp read=1545445 written=1545460
                                                         Worker 0:  Sort Method: external merge  Disk: 4121192kB
                                                         Worker 1:  Sort Method: external merge  Disk: 4121184kB
                                                         ->  Seq Scan on reporting_patient_visits visits  (cost=0.00..1386057.62 rows=30333262 width=142) (actual time=0.425..56957.588 rows=30296531 loops=3)
                                                               Buffers: shared hit=831188 read=2416987
                                       ->  Parallel Hash  (cost=556039.76..556039.76 rows=12323076 width=76) (actual time=12653.113..12653.114 rows=10098844 loops=3)
                                             Buckets: 33554432  Batches: 1  Memory Usage: 3582336kB
                                             Buffers: shared hit=1 read=432808
                                             ->  Parallel Seq Scan on reporting_prescriptions current_meds  (cost=0.00..556039.76 rows=12323076 width=76) (actual time=0.827..7166.755 rows=10098844 loops=3)
                                                   Buffers: shared hit=1 read=432808
                                 ->  Parallel Hash  (cost=22159.81..22159.81 rows=403381 width=37) (actual time=955.126..955.127 rows=320948 loops=3)
                                       Buckets: 1048576  Batches: 1  Memory Usage: 80000kB
                                       Buffers: shared hit=7 read=18119
                                       ->  Parallel Seq Scan on medical_histories mh  (cost=0.00..22159.81 rows=403381 width=37) (actual time=0.330..813.405 rows=320948 loops=3)
                                             Filter: (deleted_at IS NULL)
                                             Rows Removed by Filter: 2
                                             Buffers: shared hit=7 read=18119
                           ->  Hash  (cost=1925.82..1925.82 rows=1726 width=236) (actual time=26.228..26.237 rows=2284 loops=3)
                                 Buckets: 4096 (originally 2048)  Batches: 1 (originally 1)  Memory Usage: 588kB
                                 Buffers: shared hit=16572
                                 ->  Merge Join  (cost=1609.98..1925.82 rows=1726 width=236) (actual time=22.896..24.844 rows=2284 loops=3)
                                       Merge Cond: (org_regions.path = (subpath(state_regions.path, 0, '-1'::integer)))
                                       Buffers: shared hit=16572
                                       ->  Index Scan using index_regions_on_unique_path on regions org_regions  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.012..0.551 rows=1543 loops=3)
                                             Buffers: shared hit=3183
                                       ->  Sort  (cost=1609.57..1613.89 rows=1726 width=316) (actual time=22.877..23.036 rows=2284 loops=3)
                                             Sort Key: (subpath(state_regions.path, 0, '-1'::integer))
                                             Sort Method: quicksort  Memory: 1237kB
                                             Buffers: shared hit=13389
                                             Worker 0:  Sort Method: quicksort  Memory: 1237kB
                                             Worker 1:  Sort Method: quicksort  Memory: 1237kB
                                             ->  Merge Join  (cost=1200.92..1516.77 rows=1726 width=316) (actual time=17.976..20.749 rows=2284 loops=3)
                                                   Merge Cond: (state_regions.path = (subpath(district_regions.path, 0, '-1'::integer)))
                                                   Buffers: shared hit=13389
                                                   ->  Index Scan using index_regions_on_unique_path on regions state_regions  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.010..0.849 rows=2505 loops=3)
                                                         Buffers: shared hit=4245
                                                   ->  Sort  (cost=1200.52..1204.83 rows=1726 width=278) (actual time=17.958..18.131 rows=2284 loops=3)
                                                         Sort Key: (subpath(district_regions.path, 0, '-1'::integer))
                                                         Sort Method: quicksort  Memory: 1234kB
                                                         Buffers: shared hit=9144
                                                         Worker 0:  Sort Method: quicksort  Memory: 1234kB
                                                         Worker 1:  Sort Method: quicksort  Memory: 1234kB
                                                         ->  Merge Join  (cost=791.87..1107.72 rows=1726 width=278) (actual time=12.540..15.719 rows=2284 loops=3)
                                                               Merge Cond: (district_regions.path = (subpath(block_regions.path, 0, '-1'::integer)))
                                                               Buffers: shared hit=9144
                                                               ->  Index Scan using index_regions_on_unique_path on regions district_regions  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.009..0.962 rows=2538 loops=3)
                                                                     Buffers: shared hit=4272
                                                               ->  Sort  (cost=791.47..795.78 rows=1726 width=240) (actual time=12.522..12.716 rows=2284 loops=3)
                                                                     Sort Key: (subpath(block_regions.path, 0, '-1'::integer))
                                                                     Sort Method: quicksort  Memory: 1235kB
                                                                     Buffers: shared hit=4872
                                                                     Worker 0:  Sort Method: quicksort  Memory: 1235kB
                                                                     Worker 1:  Sort Method: quicksort  Memory: 1235kB
                                                                     ->  Merge Join  (cost=382.82..698.67 rows=1726 width=240) (actual time=6.956..10.344 rows=2284 loops=3)
                                                                           Merge Cond: (block_regions.path = (subpath(facility_regions.path, 0, '-1'::integer)))
                                                                           Buffers: shared hit=4872
                                                                           ->  Index Scan using index_regions_on_unique_path on regions block_regions  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.012..0.982 rows=2555 loops=3)
                                                                                 Buffers: shared hit=4290
                                                                           ->  Sort  (cost=382.42..386.73 rows=1726 width=202) (actual time=6.933..7.139 rows=2285 loops=3)
                                                                                 Sort Key: (subpath(facility_regions.path, 0, '-1'::integer))
                                                                                 Sort Method: quicksort  Memory: 1252kB
                                                                                 Buffers: shared hit=582
                                                                                 Worker 0:  Sort Method: quicksort  Memory: 1252kB
                                                                                 Worker 1:  Sort Method: quicksort  Memory: 1252kB
                                                                                 ->  Hash Join  (cost=128.73..289.62 rows=1726 width=202) (actual time=1.610..3.597 rows=2299 loops=3)
                                                                                       Hash Cond: (facility_regions.source_id = facilities.id)
                                                                                       Buffers: shared hit=582
                                                                                       ->  Seq Scan on regions facility_regions  (cost=0.00..154.90 rows=2277 width=172) (actual time=0.008..0.883 rows=2299 loops=3)
                                                                                             Filter: ((region_type)::text = 'facility'::text)
                                                                                             Rows Removed by Filter: 711
                                                                                             Buffers: shared hit=351
                                                                                       ->  Hash  (cost=99.99..99.99 rows=2299 width=30) (actual time=1.567..1.568 rows=2299 loops=3)
                                                                                             Buckets: 4096  Batches: 1  Memory Usage: 175kB
                                                                                             Buffers: shared hit=231
                                                                                             ->  Seq Scan on facilities  (cost=0.00..99.99 rows=2299 width=30) (actual time=0.008..0.888 rows=2299 loops=3)
                                                                                                   Buffers: shared hit=231
                     ->  Hash  (cost=1925.82..1925.82 rows=1726 width=236) (actual time=28.099..28.106 rows=2284 loops=3)
                           Buckets: 4096 (originally 2048)  Batches: 1 (originally 1)  Memory Usage: 588kB
                           Buffers: shared hit=16583
                           ->  Merge Join  (cost=1609.98..1925.82 rows=1726 width=236) (actual time=24.097..26.482 rows=2284 loops=3)
                                 Merge Cond: (org_regions_1.path = (subpath(state_regions_1.path, 0, '-1'::integer)))
                                 Buffers: shared hit=16583
                                 ->  Index Scan using index_regions_on_unique_path on regions org_regions_1  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.029..0.671 rows=1543 loops=3)
                                       Buffers: shared hit=3185
                                 ->  Sort  (cost=1609.57..1613.89 rows=1726 width=316) (actual time=24.061..24.250 rows=2284 loops=3)
                                       Sort Key: (subpath(state_regions_1.path, 0, '-1'::integer))
                                       Sort Method: quicksort  Memory: 1237kB
                                       Buffers: shared hit=13398
                                       Worker 0:  Sort Method: quicksort  Memory: 1237kB
                                       Worker 1:  Sort Method: quicksort  Memory: 1237kB
                                       ->  Merge Join  (cost=1200.92..1516.77 rows=1726 width=316) (actual time=18.422..21.656 rows=2284 loops=3)
                                             Merge Cond: (state_regions_1.path = (subpath(district_regions_1.path, 0, '-1'::integer)))
                                             Buffers: shared hit=13389
                                             ->  Index Scan using index_regions_on_unique_path on regions state_regions_1  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.003..0.986 rows=2505 loops=3)
                                                   Buffers: shared hit=4245
                                             ->  Sort  (cost=1200.52..1204.83 rows=1726 width=278) (actual time=18.412..18.605 rows=2284 loops=3)
                                                   Sort Key: (subpath(district_regions_1.path, 0, '-1'::integer))
                                                   Sort Method: quicksort  Memory: 1234kB
                                                   Buffers: shared hit=9144
                                                   Worker 0:  Sort Method: quicksort  Memory: 1234kB
                                                   Worker 1:  Sort Method: quicksort  Memory: 1234kB
                                                   ->  Merge Join  (cost=791.87..1107.72 rows=1726 width=278) (actual time=12.861..16.132 rows=2284 loops=3)
                                                         Merge Cond: (district_regions_1.path = (subpath(block_regions_1.path, 0, '-1'::integer)))
                                                         Buffers: shared hit=9144
                                                         ->  Index Scan using index_regions_on_unique_path on regions district_regions_1  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.007..0.995 rows=2538 loops=3)
                                                               Buffers: shared hit=4272
                                                         ->  Sort  (cost=791.47..795.78 rows=1726 width=240) (actual time=12.845..13.038 rows=2284 loops=3)
                                                               Sort Key: (subpath(block_regions_1.path, 0, '-1'::integer))
                                                               Sort Method: quicksort  Memory: 1235kB
                                                               Buffers: shared hit=4872
                                                               Worker 0:  Sort Method: quicksort  Memory: 1235kB
                                                               Worker 1:  Sort Method: quicksort  Memory: 1235kB
                                                               ->  Merge Join  (cost=382.82..698.67 rows=1726 width=240) (actual time=7.102..10.672 rows=2284 loops=3)
                                                                     Merge Cond: (block_regions_1.path = (subpath(facility_regions_1.path, 0, '-1'::integer)))
                                                                     Buffers: shared hit=4872
                                                                     ->  Index Scan using index_regions_on_unique_path on regions block_regions_1  (cost=0.41..270.89 rows=3032 width=156) (actual time=0.006..1.197 rows=2555 loops=3)
                                                                           Buffers: shared hit=4290
                                                                     ->  Sort  (cost=382.42..386.73 rows=1726 width=202) (actual time=7.084..7.286 rows=2285 loops=3)
                                                                           Sort Key: (subpath(facility_regions_1.path, 0, '-1'::integer))
                                                                           Sort Method: quicksort  Memory: 1252kB
                                                                           Buffers: shared hit=582
                                                                           Worker 0:  Sort Method: quicksort  Memory: 1252kB
                                                                           Worker 1:  Sort Method: quicksort  Memory: 1252kB
                                                                           ->  Hash Join  (cost=128.73..289.62 rows=1726 width=202) (actual time=1.523..3.795 rows=2299 loops=3)
                                                                                 Hash Cond: (facility_regions_1.source_id = facilities_1.id)
                                                                                 Buffers: shared hit=582
                                                                                 ->  Seq Scan on regions facility_regions_1  (cost=0.00..154.90 rows=2277 width=172) (actual time=0.018..1.169 rows=2299 loops=3)
                                                                                       Filter: ((region_type)::text = 'facility'::text)
                                                                                       Rows Removed by Filter: 711
                                                                                       Buffers: shared hit=351
                                                                                 ->  Hash  (cost=99.99..99.99 rows=2299 width=30) (actual time=1.474..1.475 rows=2299 loops=3)
                                                                                       Buckets: 4096  Batches: 1  Memory Usage: 175kB
                                                                                       Buffers: shared hit=231
                                                                                       ->  Seq Scan on facilities facilities_1  (cost=0.00..99.99 rows=2299 width=30) (actual time=0.012..0.898 rows=2299 loops=3)
                                                                                             Buffers: shared hit=231
 Planning:
   Buffers: shared hit=1242 read=34
 Planning Time: 26.536 ms
 Execution Time: 813398.097 ms
(246 rows)</pre>
</details>

We have the good folk such as Hubert "depesz" Lubaczewski who has blessed us with a [rather fine tool](explain.depesz.com) for dealing with Rather Friendly Outputs.

[image of depesz screenshot]

My Rather Friendly Output is friendlier still, as I have a big red box honking at me pointing to what has gone wrong. But my well-bred engineer brain thought: Now What?!

Sir depesz in his rather fine tool hinted at a `work_mem` problem. But how must I think and reason about this? What can my hardware support? I had little experience with PostgreSQL knobs.

A month before the aforementioned day of yore, October 2024, people were saying glowing things about a model now known as Sonnet 3.6, then known as Sonnet 3.5 (new). Simpler times. What matters here is that it was the clear best model when there were clear best AI models.

I did what few well-bred engineers where doing at the time. I shoved my plan and my hardware spec into Sir Sonnet 3.5 (new).

This was my prompt:

<blockquote>
This is a PostgreSQL EXPLAIN ANALYZE output

Tell me what configuration parameters I can tune to make this go faster.

<system_info>
RAM = 32 GB
Current parameters:
          synchronous_commit: "on"
          max_connections: "200"
          shared_buffers: "8GB"
          effective_cache_size: "24GB"
          maintenance_work_mem: "2GB"
          checkpoint_completion_target: "0.9"
          wal_buffers: "16MB"
          default_statistics_target: "100"
          random_page_cost: "1.1"
          effective_io_concurrency: "200"
          work_mem: "20971kB"  # NOTE: but for just this query, we temporarily have set it to 1.5GB, which is the most we can push it safely
          min_wal_size: "1GB"
          max_wal_size: "4GB"
          max_worker_processes: "4"
          max_parallel_workers_per_gather: "2"
          max_parallel_workers: "4"
          max_parallel_maintenance_workers: "2"
</system_info>
</blockquote>

Sir Sonnet said so:

<blockquote>
# PostgreSQL Performance Analysis

## Key Performance Metrics
- Total Execution Time: 813.4 seconds (13.5 minutes)
- Planning Time: 26.5ms
- Total Rows: 30,302,109
- Buffer Usage:
  - Shared Hit: 1,741,739
  - Shared Read: 6,483,035
  - Temp Read: 8,284,857
  - Temp Written: 8,284,920

## Major Performance Issues Identified

1. **Heavy Disk I/O for Sorting**
   - Multiple large external sorts occurring
   - Largest sort using 8018MB of disk space
   - Many temp buffers being read and written

2. **Parallel Query Execution Limitations**
   - Only using 2 parallel workers
   - Several large sequential scans that could benefit from more parallelism

3. **Memory Pressure**
   - Multiple operations spilling to disk despite high work_mem
   - Large hash joins and sorts requiring temporary files

## Recommended Parameter Adjustments

### Critical Changes

1. `max_parallel_workers_per_gather`: 4 (currently 2)
   - Justification: Query shows heavy parallel operations with large sequential scans
   - This change alone could significantly improve the performance of the parallel operations

2. `work_mem`: 2GB (currently 1.5GB)
   - Justification: Multiple sorts spilling to disk
   - With 32GB RAM and considering the parallel workers, we can safely increase this
   - Note: Effective memory per sort will be work_mem × number of parallel workers

3. `max_parallel_workers`: 8 (currently 4)
   - Justification: System has enough RAM to support more parallel workers
   - Will allow better utilization of parallel operations

### Secondary Adjustments

4. `maintenance_work_mem`: 4GB (currently 2GB)
   - Justification: Large sorts occurring in maintenance operations
   - System has enough RAM to support this increase

5. `effective_io_concurrency`: 300 (currently 200)
   - Justification: Heavy I/O operations occurring
   - If using SSDs, this can be increased further

6. `random_page_cost`: 1.0 (currently 1.1)
   - Justification: If using SSDs, this should be lowered to better reflect actual I/O costs

## Additional Recommendations

1. **Index Recommendations**
   - Consider adding indexes to support these join conditions:
     - Joins between patients and reporting_prescriptions tables
     - Joins on date-based operations

2. **Table Partitioning**
   - Consider partitioning the following tables by date:
     - reporting_prescriptions
     - reporting_patient_visits
     - reporting_patient_blood_sugars
     - reporting_patient_blood_pressures

3. **Materialized Views**
   - Consider creating materialized views for the complex region hierarchy joins
   - These joins are creating multiple sorts and hash operations

## Monitoring Recommendations

After implementing these changes:
1. Monitor temp file usage (`pg_stat_database`)
2. Watch for memory pressure using `pg_stat_activity`
3. Track parallel execution effectiveness with `pg_stat_statements`
</blockquote>

Not all the recommendations made sense, but the critical ones seem good. So I obeyed the AI and reran the query.

My database crashed.

I vibed too close to the sun.

