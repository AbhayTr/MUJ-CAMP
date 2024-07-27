const FORTUNE500_LIST = ['Walmart', 'Exxon Mobil', 'Chevron', 'Berkshire Hathaway', 'Apple', 'General Motors', 'Phillips 66', 'General Electric', 'Ford Motor', 'CVS Health', 'McKesson', 'AT&T', 'Valero Energy', 'UnitedHealth Group', 'Verizon', 'AmerisourceBergen', 'Fannie Mae', 'Costco', 'HP', 'Kroger', 'JP Morgan Chase', 'Express Scripts Holding', 'Bank of America Corp.', 'IBM', 'Marathon Petroleum', 'Cardinal Health', 'Boeing', 'Citigroup', 'Amazon', 'Wells Fargo', 'Microsoft', 'Procter & Gamble', 'Home Depot', 'Archer Daniels Midland', 'Walgreens', 'Target', 'Johnson & Johnson', 'Anthem', 'MetLife', 'Google', 'State Farm Insurance Cos.', 'Freddie Mac', 'Comcast', 'PepsiCo', 'United Technologies', 'AIG', 'UPS', 'Dow Chemical', 'Aetna', "Lowe's", 'ConocoPhillips', 'Intel', 'Energy Transfer Equity', 'Caterpillar', 'Prudential Financial', 'Pfizer', 'Disney', 'Humana', 'Enterprise Products Partners', 'Cisco Systems', 'Sysco', 'Ingram Micro', 'Coca-Cola', 'Lockheed Martin', 'FedEx', 'Johnson Controls', 'Plains GP Holdings', 'World Fuel Services', 'CHS', 'American Airlines Group', 'Merck', 'Best Buy', 'Delta Air Lines', 'Honeywell International', 'HCA Holdings', 'Goldman Sachs Group', 'Tesoro', 'Liberty Mutual Insurance Group', 'United Continental Holdings', 'New York Life Insurance', 'Oracle', 'Morgan Stanley', 'Tyson Foods', 'Safeway', 'Nationwide', 'Deere', 'DuPont', 'American Express', 'Allstate', 'Cigna', 'Mondelez International', 'TIAA-CREF', 'INTL FCStone', 'Massachusetts Mutual Life Insurance', 'DirecTV', 'Halliburton', 'Twenty-First Century Fox', '3M', 'Sears Holdings', 'General Dynamics', 'Publix Super Markets', 'Philip Morris International', 'TJX', 'Time Warner', "Macy's", 'Nike', 'Tech Data', 'Avnet', 'Northwestern Mutual', "McDonald's", 'Exelon', 'Travelers Cos.', 'Qualcomm', 'International Paper', 'Occidental Petroleum', 'Duke Energy', 'Rite Aid', 'Gilead Sciences', 'Baker Hughes', 'Emerson Electric', 'EMC', 'USAA', 'Union Pacific', 'Northrop Grumman', 'Alcoa', 'Capital One Financial', 'National Oilwell Varco', 'US Foods', 'Raytheon', 'Time Warner Cable', 'Arrow Electronics', 'Aflac', 'Staples', 'Abbott Laboratories', 'Community Health Systems', 'Fluor', 'Freeport-McMoRan', 'U.S. Bancorp', 'Nucor', 'Kimberly-Clark', 'Hess', 'Chesapeake Energy', 'Xerox', 'ManpowerGroup', 'Amgen', 'AbbVie', 'Danaher', 'Whirlpool', 'PBF Energy', 'HollyFrontier', 'Eli Lilly', 'Devon Energy', 'Progressive', 'Cummins', 'Icahn Enterprises', 'AutoNation', "Kohl's", 'Paccar', 'Dollar General', 'Hartford Financial Services Group', 'Southwest Airlines', 'Anadarko Petroleum', 'Southern', 'Supervalu', 'Kraft Foods Group', 'Goodyear Tire & Rubber', 'EOG Resources', 'CenturyLink', 'Altria Group', 'Tenet Healthcare', 'General Mills', 'eBay', 'ConAgra Foods', 'Lear', 'TRW Automotive Holdings', 'United States Steel', 'Penske Automotive Group', 'AES', 'Colgate-Palmolive', 'Global Partners', 'Thermo Fisher Scientific', 'PG&E Corp.', 'NextEra Energy', 'American Electric Power', 'Baxter International', 'Centene', 'Starbucks', 'Gap', 'Bank of New York Mellon Corp.', 'Micron Technology', 'Jabil Circuit', 'PNC Financial Services Group', 'Kinder Morgan', 'Office Depot', 'Bristol-Myers Squibb', 'NRG Energy', 'Monsanto', 'PPG Industries', 'Genuine Parts', 'Omnicom Group', 'Illinois Tool Works', 'Murphy USA', "Land O'Lakes", 'Western Refining', 'Western Digital', 'FirstEnergy', 'Aramark', 'DISH Network', 'Las Vegas Sands', 'Kellogg', 'Loews', 'CBS', 'Ecolab', 'Whole Foods Market', 'Chubb', 'Health Net', 'Waste Management', 'Apache', 'Textron', 'Synnex', 'Marriott International', 'Viacom', 'Lincoln National', 'Nordstrom', 'C.H. Robinson Worldwide', 'Edison International', 'Marathon Oil', 'Yum Brands', 'Computer Sciences', 'Parker-Hannifin', 'DaVita HealthCare Partners', 'CarMax', 'Texas Instruments', 'WellCare Health Plans', 'Marsh & McLennan', 'Consolidated Edison', 'Oneok', 'Visa', 'Jacobs Engineering Group', 'CSX', 'Entergy', 'Facebook', 'Dominion Resources', 'Leucadia National', 'Toys "R" Us', 'DTE Energy', 'Ameriprise Financial', 'VF', 'Praxair', 'J.C. Penney', 'Automatic Data Processing', 'L-3 Communications', 'CDW', 'Guardian Life Ins. Co. of America', 'Xcel Energy', 'Norfolk Southern', 'PPL', 'R.R. Donnelley & Sons', 'Huntsman', 'Bed Bath & Beyond', 'Stanley Black & Decker', 'L Brands', 'Liberty Interactive', 'Farmers Insurance Exchange', 'First Data', 'Sherwin-Williams', 'BlackRock', 'Voya Financial', 'Ross Stores', 'Sempra Energy', 'Estee Lauder', 'H.J. Heinz', 'Reinsurance Group of America', 'Public Service Enterprise Group', 'Cameron International', 'Navistar International', 'CST Brands', 'State Street Corp.', 'Unum Group', 'Hilton Worldwide Holdings', 'Family Dollar Stores', 'Principal Financial', 'Reliance Steel & Aluminum', 'Air Products & Chemicals', 'Assurant', "Peter Kiewit Sons'", 'Henry Schein', 'Cognizant Technology Solutions', 'MGM Resorts International', 'W.W. Grainger', 'Group 1 Automotive', 'BB&T Corp.', 'Rock-Tenn', 'Advance Auto Parts', 'Ally Financial', 'AGCO', 'Corning', 'Biogen', 'NGL Energy Partners', 'Stryker', 'Molina Healthcare', 'Precision Castparts', 'Discover Financial Services', 'Genworth Financial', 'Eastman Chemical', 'Dean Foods', 'AutoZone', 'MasterCard', 'Owens & Minor', 'Hormel Foods', 'GameStop', 'Autoliv', 'CenterPoint Energy', 'Fidelity National Financial', 'Sonic Automotive', 'HD Supply Holdings', 'Charter Communications', 'Crown Holdings', 'Applied Materials', 'Mosaic', 'CBRE Group', 'Avon Products', 'Republic Services', 'Universal Health Services', 'Darden Restaurants', 'Steel Dynamics', 'SunTrust Banks', 'Caesars Entertainment', 'Targa Resources', 'Dollar Tree', 'News Corp.', 'Ball', 'Thrivent Financial for Lutherans', 'Masco', 'Franklin Resources', 'Avis Budget Group', 'Reynolds American', 'Becton Dickinson', 'Priceline Group', 'Broadcom', 'Tenneco', 'Campbell Soup', 'AECOM', 'Visteon', 'Delek US Holdings', 'Dover', 'BorgWarner', 'Jarden', 'UGI', 'Murphy Oil', 'PVH', 'Core-Mark Holding', 'Calpine', 'D.R. Horton', 'Weyerhaeuser', 'KKR', 'FMC Technologies', 'American Family Insurance Group', 'SpartanNash', 'WESCO International', 'Quanta Services', 'Mohawk Industries', 'Motorola Solutions', 'Lennar', 'TravelCenters of America', 'Sealed Air', 'Eversource Energy', 'Coca-Cola Enterprises', 'Celgene', 'Williams', 'Ashland', 'Interpublic Group', 'Blackstone Group', 'Ralph Lauren', 'Quest Diagnostics', 'Hershey', 'Terex', 'Boston Scientific', 'Newmont Mining', 'Allergan', "O'Reilly Automotive", "Casey's General Stores", 'CMS Energy', 'Foot Locker', 'W.R. Berkley', 'PetSmart', 'Pacific Life', 'Commercial Metals', 'Agilent Technologies', 'Huntington Ingalls Industries', 'Mutual of Omaha Insurance', 'Live Nation Entertainment', "Dick's Sporting Goods", 'Oshkosh', 'Celanese', 'Spirit AeroSystems Holdings', 'United Natural Foods', 'Peabody Energy', 'Owens-Illinois', "Dillard's", 'Level 3 Communications', 'Pantry', 'LKQ', 'Integrys Energy Group', 'Symantec', 'Buckeye Partners', 'Ryder System', 'SanDisk', 'Rockwell Automation', 'Dana Holding', 'Lansing Trade Group', 'NCR', 'Expeditors International of Washington', 'Omnicare', 'AK Steel Holding', 'Fifth Third Bancorp', 'Seaboard', 'NiSource', 'Cablevision Systems', 'Anixter International', 'EMCOR Group', 'Fidelity National Information Services', 'Barnes & Noble', 'KBR', 'Auto-Owners Insurance', 'Jones Financial', 'Avery Dennison', 'NetApp', 'iHeartMedia', 'Discovery Communications', 'Harley-Davidson', 'Sanmina', 'Trinity Industries', 'J.B. Hunt Transport Services', 'Charles Schwab', 'Erie Insurance Group', 'Dr Pepper Snapple Group', 'Ameren', 'Mattel', 'Laboratory Corp. of America', 'Gannett', 'Starwood Hotels & Resorts', 'General Cable', 'A-Mark Precious Metals', 'Graybar Electric', 'Energy Future Holdings', 'HRG Group', 'MRC Global', 'Spectra Energy', 'Asbury Automotive Group', 'Packaging Corp. of America', 'Windstream Holdings', 'PulteGroup', 'JetBlue Airways', 'Newell Rubbermaid', 'Con-way', 'Calumet Specialty Products Partners', 'Expedia', 'American Financial Group', 'Tractor Supply', 'United Rentals', 'Ingredion', 'Navient', 'MeadWestvaco', 'AGL Resources', 'St. Jude Medical', 'J.M. Smucker', 'Western Union', 'Clorox', 'Domtar', 'Kelly Services', 'Old Republic International', 'Advanced Micro Devices', 'Netflix', 'Booz Allen Hamilton Holding', 'Quintiles Transnational Holdings', 'Wynn Resorts', 'Jones Lang LaSalle', 'Regions Financial', 'CH2M Hill', 'Western & Southern Financial Group', 'Lithia Motors', 'salesforce.com', 'Alaska Air Group', 'Host Hotels & Resorts', 'Harman International Industries', 'Amphenol', 'Realogy Holdings', 'Essendant', 'Hanesbrands', 'Kindred Healthcare', 'ARRIS Group', 'Insight Enterprises', 'Alliance Data Systems', 'LifePoint Health', 'Pioneer Natural Resources', 'Wyndham Worldwide', 'Owens Corning', 'Alleghany', 'McGraw Hill Financial', 'Big Lots', 'Northern Tier Energy', 'Hexion', 'Markel', 'Noble Energy', 'Leidos Holdings', 'Rockwell Collins', 'Airgas', 'Sprague Resources', 'YRC Worldwide', 'Hanover Insurance Group', 'Fiserv', 'Lorillard', 'American Tire Distributors Holdings', 'ABM Industries', 'Sonoco Products', 'Harris', 'Telephone & Data Systems', 'Wisconsin Energy', 'Linn Energy', 'Raymond James Financial', 'Berry Plastics Group', 'Regency Energy Partners', 'SCANA', 'Cincinnati Financial', 'Atmos Energy', 'Pepco Holdings', 'Flowserve', 'Simon Property Group', 'Constellation Brands', 'Quad/Graphics', 'Burlington Stores', 'Neiman Marcus Group', 'Bemis', 'Coach', 'Continental Resources', 'Ascena Retail Group', 'Zoetis', 'Orbital ATK', 'Frontier Communications', 'Levi Strauss', 'SPX', 'CF Industries Holdings', 'Michaels Cos.', 'M&T Bank Corp.', 'Rush Enterprises', 'Aleris', 'Nexeo Solutions Holdings', 'Keurig Green Mountain', 'Superior Energy Services', 'Williams-Sonoma', 'Robert Half International', 'Nvidia', 'First American Financial', 'Zimmer Holdings', 'MDU Resources Group', 'Juniper Networks', 'Arthur J. Gallagher', 'Colfax', 'Cliffs Natural Resources', 'Yahoo', 'MasTec', 'Lam Research', 'Axiall', 'Intercontinental Exchange', 'Cintas', 'Coty', 'CA', 'Andersons', 'Valspar', 'Northern Trust', 'Intuit', 'Tutor Perini', 'Polaris Industries', 'Hospira', 'FM Global', 'NVR', 'Liberty Media', 'Energizer Holdings', "Bloomin' Brands", 'Avaya', 'Westlake Chemical', 'Hyatt Hotels', 'Mead Johnson Nutrition', 'Activision Blizzard', 'Protective Life', 'Envision Healthcare Holdings', 'Fortune Brands Home & Security', 'RPM International', 'VWR', 'LPL Financial Holdings', 'KeyCorp', 'Swift Transportation', 'Alpha Natural Resources', 'Hasbro', 'Resolute Forest Products', 'Tiffany', 'McCormick', 'Graphic Packaging Holding', 'Greif', 'Allegheny Technologies', 'Securian Financial Group', 'B/E Aerospace', 'Exelis', 'Adobe Systems', 'Molson Coors Brewing', "Roundy's", 'CNO Financial Group', 'Adams Resources & Energy', 'Belk', 'Chipotle Mexican Grill', 'American Tower', 'FMC', 'Hillshire Brands', 'AmTrust Financial Services', 'Brunswick', 'Patterson', 'Southwestern Energy', 'Ametek', 'T. Rowe Price', 'Torchmark', 'Darling Ingredients', 'Leggett & Platt', 'Watsco', 'Crestwood Equity Partners', 'Xylem', 'Silgan Holdings', 'Toll Brothers', 'Manitowoc', 'Science Applications International', 'Carlyle Group', 'Timken', 'Genesis Energy', 'WPX Energy', 'CareFusion', 'Pitney Bowes', 'Ingles Markets', 'PolyOne', 'Brookdale Senior Living', 'CommScope Holding', 'Meritor', 'Joy Global', 'Unified Grocers', 'Triumph Group', 'Magellan Health', 'Sally Beauty Holdings', 'Flowers Foods', 'Abercrombie & Fitch', 'New Jersey Resources', 'Fastenal', 'NII Holdings', 'Consol Energy', 'USG', "Brink's", 'Helmerich & Payne', 'Lexmark International', 'American Axle & Manufacturing', 'Crown Castle International', 'Targa Energy', 'Oceaneering International', 'Cabot', 'CIT Group', "Cabela's", 'Forest Laboratories', 'DCP Midstream Partners', 'Ryerson Holding', 'QEP Resources', 'Thor Industries', 'HSN', 'Graham Holdings', 'Electronic Arts', 'Boise Cascade', 'Hub Group', 'CACI International', 'Roper Technologies', 'Towers Watson', 'Smart & Final Stores', 'Big Heart Pet Brands', 'Fossil Group', 'Nasdaq OMX Group', 'Country Financial', 'Snap-on', 'Pinnacle West Capital', 'EchoStar', 'Systemax', 'WhiteWave Foods', 'CUNA Mutual Group', 'Cooper Tire & Rubber', 'ADT', 'Cerner', 'Clean Harbors', 'First Solar', 'Lennox International', 'Enable Midstream Partners', 'Hubbell', 'Unisys', 'Alliant Energy', 'Health Care REIT', "Moody's", 'C.R. Bard', 'Urban Outfitters', 'Church & Dwight', 'American Eagle Outfitters', 'Oaktree Capital Group', 'Regal Beloit', "Men's Wearhouse", 'Cooper-Standard Holdings', 'W.R. Grace', 'Ulta Salon Cosmetics & Fragrance', 'Hawaiian Electric Industries', 'SkyWest', 'Green Plains', 'LVB Acquisition', 'NBTY', 'Carlisle', 'United Refining', 'Tesla Motors', 'Groupon', 'Landstar System', 'Patterson-UTI Energy', 'EP Energy', 'ON Semiconductor', 'Rent-A-Center', 'SunGard Data Systems', 'Citrix Systems', 'Amkor Technology', 'TD Ameritrade Holding', 'Worthington Industries', 'Valmont Industries', 'Iron Mountain', 'Puget Energy', 'CME Group', 'IAC/InterActiveCorp', 'Par Petroleum', 'Taylor Morrison Home', 'Chiquita Brands International', 'International Flavors & Fragrances', 'Whiting Petroleum', 'Under Armour', 'Ventas', 'NuStar Energy', 'Select Medical Holdings', 'Diebold', 'American National Insurance', 'Varian Medical Systems', 'Apollo Education Group', 'Westinghouse Air Brake Technologies', 'SunPower', 'Warner Music Group', 'American Water Works', 'H&R Block', 'Mercury General', 'TECO Energy', 'Service Corp. International', 'Vulcan Materials', 'Brown-Forman', 'Regal Entertainment Group', 'Tempur Sealy International', 'Steelcase', 'MWI Veterinary Supply', 'RadioShack', 'Sprouts Farmers Market', 'Sabre', 'Martin Marietta Materials', 'Huntington Bancshares', 'Alere', 'TreeHouse Foods', 'Arch Coal', 'KLA-Tencor', 'Crane', 'Iasis Healthcare', 'Babcock & Wilcox', 'Dentsply International', 'Tribune Media', 'ScanSource', 'Univision Communications', 'Brinker International', 'Exterran Holdings', "Carter's", 'Analog Devices', 'Genesco', 'Scotts Miracle-Gro', 'Convergys', 'Exide Technologies', 'WABCO Holdings', 'Kennametal', 'Amerco', 'Bon-Ton Stores', 'Team Health Holdings', 'Regeneron Pharmaceuticals', 'Springleaf Holdings', 'Lincoln Electric Holdings', 'Dresser-Rand Group', 'West', 'Benchmark Electronics', 'Pall', 'Old Dominion Freight Line', 'MSC Industrial Direct', 'Sentry Insurance Group', 'Sigma-Aldrich', 'WGL Holdings', 'Weis Markets', 'Sanderson Farms', 'StanCorp Financial Group', 'Hyster-Yale Materials Handling', 'Wolverine World Wide', 'DST Systems', 'Legg Mason', 'Teradata', "Aaron's", 'Antero Resources', 'Metaldyne Performance Group', 'Range Resources', 'Vornado Realty Trust', 'Boyd Gaming', 'Covance', 'Armstrong World Industries', 'Cracker Barrel Old Country Store', "Chico's FAS", 'Scripps Networks Interactive', 'Universal Forest Products', 'Concho Resources', 'ITT', 'HCC Insurance Holdings', 'Moog', 'IMS Health Holdings', 'Cinemark Holdings', 'Comerica', 'Equity Residential', 'Ryland Group', 'GNC Holdings', 'ArcBest', 'Vectren', 'Curtiss-Wright', 'Tupperware Brands', 'Westar Energy', 'Albemarle', 'AptarGroup', 'Pinnacle Foods', 'Penn National Gaming', 'J.Crew Group', 'Vantiv', 'Kansas City Southern', 'Caleres', 'Nu Skin Enterprises', 'Great Plains Energy', 'Kirby', 'General Growth Properties', 'Broadridge Financial Solutions', 'Stericycle', 'Global Payments', 'Nortek', 'Schnitzer Steel Industries', 'Universal', 'ANN', 'Hologic', 'Panera Bread', 'AOL', 'SM Energy', 'Paychex', 'PriceSmart', 'Autodesk', 'Affiliated Managers Group', 'Tops Holding', 'Dynegy', 'DSW', 'Vishay Intertechnology', 'Mettler-Toledo International', 'SunEdison', 'Tetra Tech', 'Momentive Performance Materials', 'EnerSys', 'Donaldson', 'EQT', 'Monster Beverage', 'PC Connection', 'Total System Services', 'ServiceMaster Global Holdings', 'Medical Mutual of Ohio', 'Applied Industrial Technologies', 'Maxim Integrated Products', 'OGE Energy', 'A. Schulman', 'Equinix', 'Mednax', 'Equifax', 'Standard Pacific', 'Denbury Resources', 'Cimarex Energy', 'Mutual of America Life Insurance', 'Guess', 'Post Holdings', 'HealthSouth', 'Ferrellgas Partners', 'KB Home', 'Boston Properties', 'Trimble Navigation', 'Teledyne Technologies', 'Acuity Brands', 'Skechers U.S.A.', 'Xilinx', 'Plexus', 'Newfield Exploration', 'TransDigm Group', 'Kar Auction Services', 'Mueller Industries', 'Zions Bancorp.', 'Insperity', 'XPO Logistics', 'Sears Hometown & Outlet Stores', 'A.O. Smith', 'Alliance One International', 'Take-Two Interactive Software', 'hhgregg', 'RPC', 'NewMarket', 'Beacon Roofing Supply', 'Edwards Lifesciences', 'Triple-S Management', 'Hawaiian Holdings', 'Heartland Payment Systems', 'Belden', 'Magellan Midstream Partners', 'Outerwall', 'KapStone Paper & Packaging', 'Alliance Holdings', 'Skyworks Solutions', 'Ciena', 'Granite Construction', 'Education Management', 'Party City Holdings', 'HCP', 'Parexel International', 'Delta Tucker Holdings', 'Pinnacle Entertainment', 'Stifel Financial', 'Pool', 'Olin', 'Knights of Columbus', 'PerkinElmer', 'Alexion Pharmaceuticals', 'IHS', 'Oil States International', 'HNI', 'LinkedIn', 'Diplomat Pharmacy', 'Brocade Communications Systems', 'Greenbrier Cos.', 'AMC Networks', 'Kemper', 'Ocwen Financial', 'Public Storage', 'TriNet Group', 'Chemtura', 'Symetra Financial', 'Tower International', 'Meritage Homes', 'MarkWest Energy Partners', 'Bio-Rad Laboratories', 'TrueBlue', 'Cabot Oil & Gas', 'Carpenter Technology', 'Toro', 'American Equity Investment Life Holding', 'Express', 'Eastman Kodak', 'Hain Celestial Group', 'Nationstar Mortgage Holdings', 'IDEX', 'Popular', 'Werner Enterprises', 'Esterline Technologies', 'Intuitive Surgical', 'Allison Transmission Holdings', 'SemGroup', 'Southwest Gas', 'G-III Apparel Group', 'National Fuel Gas', 'H.B. Fuller', 'Penn Mutual Life Insurance', 'RCS Capital', 'Columbia Sportswear', 'Amica Mutual Insurance', 'Primoris Services', 'Energen', 'Rexnord', 'Seventy Seven Energy', 'Waste Connections', 'Pep Boys-Manny, Moe & Jack', 'Harsco', 'Hovnanian Enterprises', 'Willbros Group', "Wendy's", 'International Game Technology', 'Synopsys', 'Universal American', 'AAR', 'Selective Insurance Group', 'Gartner', 'E*Trade Financial'];

const QS100_LIST = ['Massachusetts Institute of Technology', 'University of Cambridge', 'University of Oxford', 'Harvard University', 'Stanford University', 'Imperial College London', 'ETH Zurich', 'National University of Singapore', 'University College London', 'UCL', 'University of California, Berkeley', 'University of Chicago', 'University of Pennsylvania', 'Cornell University', 'The University of Melbourne', 'California Institute of Technology', 'CalTech', 'Yale University', 'Peking University', 'Princeton University', 'The University of New South Wales', 'UNSW Sydney', 'The University of Sydney', 'University of Toronto', 'The University of Edinburgh', 'Columbia University', 'University PSL', 'Tsinghua University', 'Nanyang Technological University', 'Nanyang Technological University, Singapore', 'NTU Singapore', 'NTU', 'The University of Hong Kong', 'Johns Hopkins University', 'The University of Tokyo', 'University of California', 'University of California, Los Angeles', 'UCLA', 'McGill University', 'The University of Manchester', 'University of Michigan-Ann Arbor', 'Australian National University', 'University of British Columbia', 'EPFL â€“ Ã‰cole polytechnique fÃ©dÃ©rale de Lausanne', 'Technical University of Munich', 'Institut Polytechnique de Paris', 'New York University', 'NYU', "King's College London", 'Seoul National University', 'Monash University', 'The University of Queensland', 'Zhejiang University', 'The London School of Economics and Political Science', 'Kyoto University', 'Delft University of Technology', 'Northwestern University', 'The Chinese University of Hong Kong', 'CUHK', 'Fudan University', 'Shanghai Jiao Tong University', 'Carnegie Mellon University', 'University of Amsterdam', 'Ludwig-Maximilians-UniversitÃ¤t MÃ¼nchen', 'University of Bristol', 'KAIST - Korea Advanced Institute of Science & Technology', 'Duke University', 'University of Texas at Austin', 'Sorbonne University', 'The Hong Kong University of Science and Technology', 'KU Leuven', 'University of California', 'University of California, San Diego', 'UCSD', 'University of Washington', 'University of Illinois at Urbana-Champaign', 'The Hong Kong Polytechnic University', 'Universiti Malaya', 'The University of Warwick', 'The University of Auckland', 'National Taiwan University', 'City University of Hong Kong', 'UniversitÃ© Paris-Saclay', 'The University of Western Australia', 'Brown University', 'KTH Royal Institute of Technology', 'University of Leeds', 'University of Glasgow', 'Yonsei University', 'Durham University', 'Korea University', 'Osaka University', '"Trinity College Dublin, The University of Dublin"', 'University of Southampton', 'Pennsylvania State University', 'University of Birmingham', 'Lund University', 'Universidade de SÃ£o Paulo', 'Lomonosov Moscow State University', 'UniversitÃ¤t Heidelberg', 'The University of Adelaide', 'University of Technology Sydney', 'Tokyo Institute of Technology', 'Tokyo Tech', 'University of Zurich', 'Boston University', 'Universidad Nacional AutÃ³noma de MÃ©xico', 'Universidad de Buenos Aires', 'University of St Andrews', 'Georgia Institute of Technology', 'Freie Universitaet Berlin', 'Purdue University', 'Pohang University of Science And Technology', 'POSTECH', 'University of Nottingham', 'University of Wisconsin-Madison', 'Pontificia Universidad CatÃ³lica de Chile', 'UC', 'The University of Sheffield', 'Uppsala University'];

const getPrompt = (prompt: string, prevPrompt?: string): string => {
    return `
        
        Hello Buddy. Now understand my instructions very carefully. I have a MongoDB Database which basically stores data for my college's alumni data. That database has a collection which is named as "doar_db". That collection has documents, where each document represents one alumni. The structure of the document is as follows:

        {
            "_id": {
            "$oid": any random mongodb id
            },
            "name": Name of the Alumni (eg. "Abhay Tripathi"),
            "gender": Gender of the Alumni (eg. "male", "female", "not specified", etc.),
            "muj_from": Year in which the alumni enrolled in our college (eg. 2021),
            "muj_to": Year in which the alumni graduated from our college (eg. 2025),
            "degree": Degree with specialization which the alumni pursued in our college (eg. "B.Tech (Computer Science and Engineering)"),
            "school": School to which the alumni belonged to in our college (eg. "School of Computer Science and Engineering"),
            "faculty": Faculty to which the alumni belonged to in our college (eg. "Faculty of Engineering"),
            "designation": The current designation of the alumni in their current company (eg. "Software Engineer"),
            "company": The current company in which the alumni is working (eg. "Google"),
            "prev_work": [ // Previous Work experience of the alumni in the form of a list of each experience's data.
                {
                    "designation": The designation of the alumni in this experience (eg. "Network Engineer"),
                    "company": The company of the alumni in this experience (eg. "Cisco"),
                    "untilWhen": The year till which the alumni was working in that experience (eg. 2021)
                },
                // One more example of previous work data.
                {
                    "designation": "Full Stack Web Developer",
                    "company": "Manipal University Jaipur",
                    "untilWhen": "2023"
                }
            ],
            "education": [ // Other education qualification of the alumni apart from our college in the form of a list of each qualification's data.
                {
                    "institution": The name of the institution where the alumni pursued the education in this qualification (eg. "Harvard University"),
                    "degree": The degree which the alumni pursued in this qualification (eg. "Bachelor of Science in Computer Science"),
                    "from": Year in which the alumni enrolled in the institution in this qualification (eg. 2025),
                    "to": Year in which the alumni graduated in this qualification (eg. 2030)
                },
                // One more example of previous qualification data.
                {
                    "institution": "Delhi Public School (DPS), Sector - 45, Gurgaon (Gurugram)",
                    "degree": "High School Diploma",
                    "from": "2007",
                    "to": "2021"
                }
            ],
            "phone": The phone number of the alumni (eg. "+91-8800958568"),
            "email": The email of the alumni (eg. "abhay-tripathi@live.com"),
            "location": The current location of the alumni where the alumni is residing (eg. "Gurgaon, Haryana, India"),
            "country": The current country where the alumni is residing (eg. "India"),
            "alumniId": Our System ID for the alumni (eg. "3442655"),
            "regNumber": Our System ID for the alumni when they were a student (eg. "219301226"),
            "linkedin": LinkedIn URL of the alumni (eg. "https://linkedin.com/in/abhaytri"),
            "qs100": Tells whether the alumni was a student of any QS Ranking Top 100 University or not. Can have 2 values, "Yes" or "No".,
            "fortune500": Tells whether the alumni was an employee of any Fortune 500 Company or not. Can have 2 values, "Yes" or "No".,
            "membership": Tells the current membership status of the alumni with our college's alumni association. There can be 3 values for this field: "Yearly" implying that the alumni has the yearly membership, "Lifetime" implying that the alumni has the lifetime membership and "N.A." implying that the alumni has no membership.,
            "liStatus": { // This is the status of the alumni's linkedin data syncing and updation.
                "lastUpdated": A timestamp which tells when the data was last synced successfully (eg. 1714470784). If it is "-", it means that data has been never synced from linkedin for this alumni,
                "latestStatus": Single character to depict the last status of the alumni's linkedin data syncing update. "s" means data was updated successfully and "f" means that the data was not updated successfully,
                "currentStatus": String which depicts the current status of the updation process of the Alumni Data. "l" means that the data is currently being synced from LinkedIn for the alumni, "nl" means that the data is current not being synced from LinkedIn for that alumni, and "-" means that there is no linkedin url available to the system for this alumni and hence data syncing is not possible.
            }
        }

        Remember for all the data fields in the document, the value can also be "N.A.", "" or null. So you have to remember to handle those as well, if required.

        Now that you have understood the data structure, let me explain what you have to do. Basically I am visualsing this data in the form of a dashboard. In the dashboard, there are 2 kinds of data: "graph" (Bar Graph) and "stat" (Simple Numerical Count). I also refer to these as "visuals". There can be any number of visuals in the dashboard, either of the type "graph" or "stat". Now the dashboard manager wants to add a new "visual". The "visual" can either be of the kind "graph" or "stat" as I mentioned before. But, how do we know the type of the new visual, also how do we get to know what data should be extracted exactly to match the requirements of the new "visual". Well, that's where you come in!

        So basically to create a new "visual", the dashboard manager will give a prompt which will explain what kind of data is required for the new visual, and also what kind of "visual" it will be. That prompt will be given to you as an input. Your first job is to analyze and understand the input prompt, and figure the type of the new "visual" i.e. whether the new visual will be a "graph" or a "stat". Then you must analyze what kind of data is being seeked. But now you might be thinking how can you extract the data which is required for the new visual, and also which format you should follow for the data output, to suite my application. Well, let's talk about that further.
        
        You must be aware that in MongoDB NodeJS driver we can directly execute queries using the db.command() function. In this function, we have to pass a JSON parameter whose structure is as follows, if I have to run an aggregation:

        {
            "aggregate": "doar_db",
            "cursor": {},
            "pipeline": [
                {
                    "$group": {
                        "_id": "$country",
                        "count": {
                            "$sum": 1
                        }
                    }
                },
                {
                    "$match": {
                        "_id": {
                            "$ne": ""
                        }
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "data": "$count",
                        "key": "$_id"
                    }
                },
                {
                    "$sort": {
                        "data": -1
                    }
                },
                {
                    "$group": {
                        "_id": null,
                        "total": {
                            "$sum": "$data"
                        },
                        "data": {
                            "$push": "$$ROOT"
                        }
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "title": "Alumni Count by Country", // Title of the result set.
                        "total": "$total", // This attribute has to be present only if the visual type is graph, else not.
                        "data": "$data", // Data for the visual.
                        "type": "graph", // Type of the visual being created.
                        "color": "green", // Color of the visual data.
                        "unit": "Alumni" // Unit of the dataset.
                    }
                }
            ]
        }

        Now as you can see, I am running an MongoDB Command using which I can fetch our college's alumni distribution country wise i.e. the number of alumni living in each country, in the format which I want for my application. Now understand the format in which I want the data output, which I get after running the query. The format is as follows:

        {
            "title": A title which you will have to generate based on the type of request being made. You have to infer this from the prompt given to you after analyzing the request (eg. "Alumni Count by Country").
            "total": This field is only required if the type of the visual is "graph", else not. It is basically the summation of all types of data to give the total no. of data points involved in this visual (eg. 10000),
            "data": The dataset which is required for the visual. Now the "data" field itself has a structure depending on the visual type:

                If the visual type is "graph", then it will be a list of all the datapoints with the following format:

                    [
                        {
                            key: The key of the data point (eg. "India"),
                            data: The data (value) of the data point (eg. 9000)
                        },
                        and so on...
                    ]

                If the visual type is "stat", then it will simply be a number depiciting the statistic require (eg. 8000).,

            "type": Type of the visual being created. It can strictly be only either "graph" or "stat".,
            "color": Color of the visual being created. It is used to represent the visual data. Just use either "green", "blue" or "orange" for this i.e. pick randomly from these 3 colors.,
            "unit": The unit of the visual data set. You have to infer this from the prompt and what kind of data is required. If you are unable to decide any unit, then simply use "Alumni".
        }

        So now you know my output structure. So your job is basically to analyze the input prompt given to you, decide on the visual type ("graph" or "stat"), visual title which best suites the visual data (keep it under 15 words), visual color and visual unit. Then you have to come up with a MongoDB Query JSON Object, which when I execute using the db.command() function, I get the output in my required format as I explained above. In the query, use the details as required and as I stated above.
        
        Once you have created the Query Object, then you have to simply return a single line string of your generated JSON. Remember to put double quotes ("") on all the keys of the JSON Object, so that your generated string can be parsed using JSON.parse() function in TypeScript.

        Now remember you can generate only 2 kind of outputs for this work:

        Either return the String of the JSON Object of the MongoDB Query, which satisfies the above stated requirements.

        Or if you cannot generate the Query due to any kind of reason (Offensive Language, Unable to understand, etc.) simply generate "np" string, that's it.

        Apart from these 2 outputs, you can't include any other words, text, data, etc. in the output. I am telling you this, because my application will directly parse your output, and process the new visual by running your given command using db.command() function with your query JSON Object as the query parameter.

        Remember few things:

        Before giving the output thoughroughly ensure that the output format is being followed i.e. the visual type, title, color, unit, total (if type is "graph"), and data is there. Also, strictly adhere to my database data format as I explained above.

        Also keep in mind the following:

        - For countries, use their full names only. For eg. for USA use United States of America.

        - In case of visuals of the type "graph", ensure that the data points are sorted based on the "data" of the data points. This can be achieved using the "$sort" aggregator.

        ${(prevPrompt === "") ? "" : `
        
        You should know that this input prompt is coming as a request to update an existing visual. The prompt which was used to create this visual was as follows:

        ${prevPrompt}

        Your job is to understand the new requirement with respect to this new visual, and give the output as I explained above.

        `}

        Now that you have understood your job, here is the input prompt:

        "${prompt}"

        Thoroughly ensure that your output is parsable by JSON.parse() JS Function. Also dont use "\\" in your string output as they could cause problems with JSON.parse() function.

        For eg. in this kind of output:

        "{
            \"aggregate\": \"doar_db\",
            \"cursor\": {},
            \"pipeline\": [
            {
                \"$match\": {
                \"country\": {
                    \"$in\": [
                    \"United States of America\",
                    \"Japan\"
                    ]
                },
                \"country\": {
                    \"$ne\": null
                }
                }
            },
            {
                \"$group\": {
                \"_id\": {
                    \"country\": \"$country\"
                },
                \"count\": {
                    \"$sum\": 1
                }
                }
            },
            {
                \"$project\": {
                \"_id\": 0,
                \"data\": \"$count\",
                \"key\": \"$_id.country\"
                }
            },
            {
                \"$sort\": {
                \"data\": -1
                }
            },
            {
                \"$group\": {
                \"_id\": null,
                \"total\": {
                    \"$sum\": \"$data\"
                },
                \"data\": {
                    \"$push\": \"$$ROOT\"
                }
                }
            },
            {
                \"$project\": {
                \"_id\": 0,
                \"title\": \"Alumni Count in USA and Japan\",
                \"total\": \"$total\",
                \"data\": \"$data\",
                \"type\": \"graph\",
                \"color\": \"green\",
                \"unit\": \"Alumni\"
                }
            }
            ]
        }"

        You can clearly see that their are "\" in the string which will cause problem with JSON.parse(). So please ensure not to use "\" in your string output. Always ensure that your string output could be parsed by JSON.parse() function. Or else my program would crash. Please ensure.

        In the "$project" field, ensure that you have set the "title", "total" (if visual type is "graph"), "data", "color" and "unit" thoroughly. If you won't, then my program will crash. Please ensure.

        Also please always ensure, that if the type of the visual is "stat", then the "data" field in the project should be of numerical format, and if the type of the visual is "graph", then the "data" field is of the format as I have mentioned above (list of {"key": %KEY%, "data": %DATA%}). Please ensure this, else my program will crash.

        Also, in case the visual is of the type "graph", then just sort the graph based on the values in the graph, in the descending order, so that the largest values are shown first, and so on. Please ensure.

        Also remember that for anything related to companies, you have to take into consideration the current company details, along with the previous work ("prev_work") of the alumni as well.

        Also remember this very clearly, if the prompt talks about Fortune 500 companies, then you should know that each alumni is marked that whether they are in a Fortune 500 company or not using the "fortune500" attribute in their mongodb collection document. If they are a Fortune 500 Company Employee, then there "fortune500" value is "Yes", else it is "No".
        
        Also remember this very clearly, if the prompt talks about QS Ranking Top 100 Colleges, then you should know that each alumni is marked that whether they are in a QS Ranking Top 100 University or not using the "qs100" attribute in their mongodb collection document. If they are a QS Ranking Top 100 University Student, then there "qs100" value is "Yes", else it is "No".

        Now you have your input prompt. Analyze it and give the output as I have explained to you above. Good Luck. Thanks.

        Also ensure that you only output the MongoDB query json. THAT'S IT. NO OTHER TEXT!

    `
}

const getCorrectionPrompt = (queryError: string, prompt: string, generatedQuery: string, prevPrompt?: string): string => {

    const originalPrompt = getPrompt(prompt, prevPrompt);

    return `

    Ok originally I had asked you to perform this action:

    ${originalPrompt}

    Then you gave me this output:

    ${generatedQuery}

    But here is the problem with the generated query related to the output format:

    ${queryError}

    Now the problem in this generated output is that it is not following the output format which I want. Remember the output format is a mongodb query json string in which aggregate's $project should contain the following:

    {
        "title": A title which you will have to generate based on the type of request being made. You have to infer this from the prompt given to you after analyzing the request (eg. "Alumni Count by Country").
        "total": This field is only required if the type of the visual is "graph", else not. It is basically the summation of all types of data to give the total no. of data points involved in this visual (eg. 10000),
        "data": The dataset which is required for the visual. Now the "data" field itself has a structure depending on the visual type:

            If the visual type is "graph", then it will be a list of all the datapoints with the following format:

                [
                    {
                        key: The key of the data point (eg. "India"),
                        data: The data (value) of the data point (eg. 9000)
                    },
                    and so on...
                ]

            If the visual type is "stat", then it will simply be a number depiciting the statistic require (eg. 8000).,

        "type": Type of the visual being created. It can strictly be only either "graph" or "stat".,
        "color": Color of the visual being created. It is used to represent the visual data. Just use either "green", "blue" or "orange" for this i.e. pick randomly from these 3 colors.,
        "unit": The unit of the visual data set. You have to infer this from the prompt and what kind of data is required. If you are unable to decide any unit, then simply use "Alumni".
    }

    So please follow the proper format and re-generate the query, while ensuring:

    In the "$project" field, ensure that you have set the "title", "total" (if visual type is "graph"), "data", "color" and "unit" thoroughly. If you won't, then my program will crash. Please ensure.

    Also please always ensure, that if the type of the visual is "stat", then the "data" field in the project should be of numerical format, and if the type of the visual is "graph", then the "data" field is of the format as I have mentioned above (list of {"key": %KEY%, "data": %DATA%}). Please ensure this, else my program will crash.

    Thanks and regards.

    `;

}

const getExecutionCorrectionPrompt = (queryError: string, prompt: string, generatedQuery: string, prevPrompt?: string): string => {

    const originalPrompt = getPrompt(prompt, prevPrompt);

    return `

    Ok originally I had asked you to perform this action:

    ${originalPrompt}

    Then you gave me this output:

    ${generatedQuery}

    But here is the problem with the generated query as its execution is failing:

    ${queryError}

    Now the problem in this generated output is that it is not executing in MongoDB when I execute using db.command() function.

    So please check your query for any errors and re-generate the query, while strictly following the above instructions and ensuring:

    In the "$project" field, ensure that you have set the "title", "total" (if visual type is "graph"), "data", "color" and "unit" thoroughly. If you won't, then my program will crash. Please ensure.

    Also please always ensure, that if the type of the visual is "stat", then the "data" field in the project should be of numerical format, and if the type of the visual is "graph", then the "data" field is of the format as I have mentioned above (list of {"key": %KEY%, "data": %DATA%}). Please ensure this, else my program will crash.

    Thanks and regards.

    `;

}

export { FORTUNE500_LIST, QS100_LIST, getPrompt, getCorrectionPrompt, getExecutionCorrectionPrompt };